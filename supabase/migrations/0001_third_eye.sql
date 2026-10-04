begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.runtime_config (key text primary key, value text not null);
comment on table private.runtime_config is 'Store sha256 of ANALYSIS_SIGNING_SECRET as analysis_secret_hash through a privileged SQL session only.';

create table public.decisions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (length(trim(decision)) between 1 and 2000),
  context text not null default '' check (length(context) <= 12000),
  options text not null default '' check (length(options) <= 4000),
  reasons text not null default '' check (length(reasons) <= 12000),
  constraints text not null default '' check (length(constraints) <= 4000),
  affected text not null default '' check (length(affected) <= 4000),
  deadline text not null default '' check (length(deadline) <= 500),
  "researchEnabled" boolean not null default false,
  revision integer not null default 1 check (revision >= 1),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(id,user_id), check (length(trim(context)) > 0 or length(trim(reasons)) > 0)
);
create table public.analyses (
  id uuid primary key default gen_random_uuid(), decision_id uuid not null, user_id uuid not null,
  input_revision integer not null check (input_revision >= 1), input_snapshot jsonb not null,
  idempotency_key uuid not null, status text not null default 'processing' check(status in ('processing','completed','failed')),
  output jsonb, questions jsonb not null default '[]', provider text, model text,
  research_status text not null default 'not_requested' check(research_status in ('not_requested','unavailable','completed','partial','failed')),
  error_code text, created_at timestamptz not null default now(), started_at timestamptz not null default now(),
  expires_at timestamptz not null, completed_at timestamptz,
  foreign key(decision_id,user_id) references public.decisions(id,user_id) on delete cascade,
  unique(user_id,decision_id,idempotency_key), unique(id,decision_id,user_id),
  check(jsonb_typeof(input_snapshot) = 'object'), check(jsonb_typeof(questions) = 'array'),
  check ((status = 'completed' and output is not null and completed_at is not null and provider is not null and model is not null)
    or (status = 'processing' and output is null and completed_at is null)
    or (status = 'failed' and output is null and completed_at is not null))
);
create table public.sources (
  id uuid primary key default gen_random_uuid(), analysis_id uuid not null, decision_id uuid not null, user_id uuid not null,
  title text not null check(length(title) <= 500), url text not null check(url ~ '^https?://' and length(url) <= 2048),
  excerpt text not null check(length(excerpt) <= 2000), retrieved_at timestamptz not null,
  foreign key(analysis_id,decision_id,user_id) references public.analyses(id,decision_id,user_id) on delete cascade
);
create table public.reflections (
  id uuid primary key default gen_random_uuid(), decision_id uuid not null, user_id uuid not null, analysis_id uuid not null,
  question_id text not null check(length(question_id) <= 100), question_text text not null,
  answer text not null check(length(trim(answer)) between 1 and 2000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(decision_id,user_id) references public.decisions(id,user_id) on delete cascade,
  foreign key(analysis_id,decision_id,user_id) references public.analyses(id,decision_id,user_id) on delete cascade,
  unique(analysis_id,question_id,user_id)
);
create index decisions_history on public.decisions(user_id,created_at desc,id desc);
create index analyses_history on public.analyses(user_id,decision_id,created_at desc,id desc);
create index analyses_rate on public.analyses(user_id,created_at desc);
create unique index analyses_active on public.analyses(decision_id) where status = 'processing';
create index sources_analysis on public.sources(analysis_id,decision_id,user_id);
create index reflections_decision on public.reflections(user_id,decision_id);

alter table public.decisions enable row level security;
alter table public.analyses enable row level security;
alter table public.sources enable row level security;
alter table public.reflections enable row level security;
create policy decisions_owner on public.decisions for select to authenticated using(user_id = (select auth.uid()));
create policy analyses_owner on public.analyses for select to authenticated using(user_id = (select auth.uid()));
create policy sources_owner on public.sources for select to authenticated using(user_id = (select auth.uid()));
create policy reflections_owner on public.reflections for select to authenticated using(user_id = (select auth.uid()));
revoke all on public.decisions,public.analyses,public.sources,public.reflections from anon,authenticated;
grant select on public.decisions,public.analyses,public.sources,public.reflections to authenticated;

create function private.require_server(p_secret text) returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or length(p_secret) < 32 or not exists (
    select 1 from private.runtime_config where key = 'analysis_secret_hash'
      and value = encode(sha256(convert_to(p_secret,'UTF8')),'hex')
  ) then raise exception 'SERVER_CREDENTIAL'; end if;
end $$;
revoke all on function private.require_server(text) from public,anon,authenticated;

create function public.create_decision(p_input jsonb) returns public.decisions language plpgsql security definer set search_path = '' as $$
declare d public.decisions;
begin
  if auth.uid() is null then raise exception 'NOT_FOUND'; end if;
  insert into public.decisions(user_id,decision,context,options,reasons,constraints,affected,deadline,"researchEnabled")
  values(auth.uid(),p_input->>'decision',coalesce(p_input->>'context',''),coalesce(p_input->>'options',''),coalesce(p_input->>'reasons',''),coalesce(p_input->>'constraints',''),coalesce(p_input->>'affected',''),coalesce(p_input->>'deadline',''),coalesce((p_input->>'researchEnabled')::boolean,false)) returning * into d;
  return d;
end $$;
create function public.update_decision(p_id uuid,p_revision integer,p_input jsonb) returns public.decisions language plpgsql security definer set search_path = '' as $$
declare d public.decisions;
begin
  select * into d from public.decisions where id=p_id and user_id=auth.uid() for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if d.revision <> p_revision then raise exception 'REVISION_CONFLICT'; end if;
  update public.decisions set decision=p_input->>'decision',context=coalesce(p_input->>'context',''),options=coalesce(p_input->>'options',''),
    reasons=coalesce(p_input->>'reasons',''),constraints=coalesce(p_input->>'constraints',''),affected=coalesce(p_input->>'affected',''),
    deadline=coalesce(p_input->>'deadline',''),"researchEnabled"=coalesce((p_input->>'researchEnabled')::boolean,false),revision=revision+1,updated_at=now()
  where id=p_id returning * into d;
  return d;
end $$;
create function public.delete_decision(p_id uuid) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  delete from public.decisions where id=p_id and user_id=auth.uid();
  if not found then raise exception 'NOT_FOUND'; end if;
  return true;
end $$;
create function public.expire_runs() returns void language sql security definer set search_path = '' as $$
  update public.analyses set status='failed',error_code='DEADLINE_EXCEEDED',completed_at=now()
  where user_id=auth.uid() and status='processing' and expires_at <= now();
$$;
create function public.begin_analysis(p_id uuid,p_revision integer,p_key uuid,p_secret text,p_timeout_ms integer,p_hourly_limit integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.decisions; a public.analyses; answers jsonb;
begin
  perform private.require_server(p_secret);
  if p_timeout_ms not between 1000 and 120000 or p_hourly_limit not between 1 and 1000 then raise exception 'INVALID_INPUT'; end if;
  -- Serialize the owner's rate check across simultaneous decisions and instances.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select * into d from public.decisions where id=p_id and user_id=auth.uid() for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  perform public.expire_runs();
  select * into a from public.analyses where decision_id=p_id and user_id=auth.uid() and idempotency_key=p_key;
  if found then
    if a.input_revision <> p_revision then raise exception 'IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('replay',true,'analysis',to_jsonb(a));
  end if;
  if d.revision <> p_revision then raise exception 'REVISION_CONFLICT'; end if;
  select * into a from public.analyses where decision_id=p_id and status='processing';
  if found then return jsonb_build_object('active',true,'analysis',to_jsonb(a)); end if;
  if (select count(*) from public.analyses where user_id=auth.uid() and created_at > now()-interval '1 hour') >= p_hourly_limit then raise exception 'RATE_LIMITED'; end if;
  select coalesce(jsonb_agg(to_jsonb(r)),'[]') into answers from (
    select id,analysis_id,question_id,question_text,answer from public.reflections
    where decision_id=p_id and user_id=auth.uid() order by updated_at desc,id desc limit 16
  ) r;
  insert into public.analyses(decision_id,user_id,input_revision,input_snapshot,idempotency_key,expires_at)
  values(p_id,auth.uid(),d.revision,to_jsonb(d)||jsonb_build_object('reflections',answers),p_key,now()+p_timeout_ms*interval '1 millisecond') returning * into a;
  return jsonb_build_object('replay',false,'analysis',to_jsonb(a));
end $$;
create function public.finish_analysis(p_id uuid,p_secret text,p_output jsonb,p_questions jsonb,p_sources jsonb,p_provider text,p_model text,p_research text,p_error text default null)
returns public.analyses language plpgsql security definer set search_path = '' as $$
declare a public.analyses; s jsonb;
begin
  perform private.require_server(p_secret);
  select * into a from public.analyses where id=p_id and user_id=auth.uid() for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if a.status <> 'processing' then return a; end if;
  if a.expires_at <= now() then
    update public.analyses set status='failed',error_code='DEADLINE_EXCEEDED',completed_at=now() where id=p_id returning * into a;
    return a;
  end if;
  if p_error is not null then
    update public.analyses set status='failed',error_code=left(p_error,80),provider=p_provider,model=p_model,research_status=p_research,completed_at=now() where id=p_id returning * into a;
    return a;
  end if;
  if jsonb_typeof(p_output) is distinct from 'object' or octet_length(p_output::text)>131072
    or jsonb_typeof(p_questions) is distinct from 'array' or jsonb_array_length(p_questions)>64
    or jsonb_typeof(p_sources) is distinct from 'array' or jsonb_array_length(p_sources)>6 then raise exception 'INVALID_INPUT'; end if;
  for s in select * from jsonb_array_elements(p_sources) loop
    insert into public.sources(id,analysis_id,decision_id,user_id,title,url,excerpt,retrieved_at)
    values((s->>'id')::uuid,a.id,a.decision_id,a.user_id,s->>'title',s->>'url',s->>'excerpt',(s->>'retrieved_at')::timestamptz);
  end loop;
  update public.analyses set status='completed',output=p_output,questions=p_questions,provider=p_provider,model=p_model,research_status=p_research,completed_at=now() where id=p_id returning * into a;
  return a;
end $$;
create function public.save_reflection(p_id uuid,p_analysis uuid,p_question text,p_answer text,p_revision integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.decisions; a public.analyses; r public.reflections; q jsonb;
begin
  select * into d from public.decisions where id=p_id and user_id=auth.uid() for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if d.revision <> p_revision then raise exception 'REVISION_CONFLICT'; end if;
  select * into a from public.analyses where id=p_analysis and decision_id=p_id and user_id=auth.uid() and status='completed';
  if not found then raise exception 'NOT_FOUND'; end if;
  select value into q from jsonb_array_elements(a.questions) where value->>'id'=p_question;
  if q is null then raise exception 'INVALID_QUESTION'; end if;
  insert into public.reflections(decision_id,user_id,analysis_id,question_id,question_text,answer)
  values(p_id,auth.uid(),p_analysis,p_question,q->>'text',p_answer)
  on conflict(analysis_id,question_id,user_id) do update set answer=excluded.answer,updated_at=now() returning * into r;
  update public.decisions set revision=revision+1,updated_at=now() where id=p_id returning * into d;
  return jsonb_build_object('reflection',to_jsonb(r),'decisionRevision',d.revision);
end $$;
revoke all on function public.create_decision(jsonb),public.update_decision(uuid,integer,jsonb),public.delete_decision(uuid),public.expire_runs(),public.begin_analysis(uuid,integer,uuid,text,integer,integer),public.finish_analysis(uuid,text,jsonb,jsonb,jsonb,text,text,text,text),public.save_reflection(uuid,uuid,text,text,integer) from public,anon;
grant execute on function public.create_decision(jsonb),public.update_decision(uuid,integer,jsonb),public.delete_decision(uuid),public.expire_runs(),public.begin_analysis(uuid,integer,uuid,text,integer,integer),public.finish_analysis(uuid,text,jsonb,jsonb,jsonb,text,text,text,text),public.save_reflection(uuid,uuid,text,text,integer) to authenticated;
commit;
