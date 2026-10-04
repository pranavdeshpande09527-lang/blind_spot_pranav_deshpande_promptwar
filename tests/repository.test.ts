import test from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Repository } from '../src/repository.js';
test('single-record RPCs normalize PostgREST composite responses without changing JSON results', async () => {
  for (const data of [{id:'test'}, [{id:'test'}]]) {
    const db = { rpc: async () => ({data,error:null}) } as unknown as SupabaseClient;
    assert.deepEqual(await new Repository(db,'test-user').rpc('create_decision'),{id:'test'});
  }
  const db = {rpc:async()=>({data:{replay:false,analysis:{id:'run'}},error:null})} as unknown as SupabaseClient;
  assert.deepEqual(await new Repository(db,'test-user').rpc('begin_analysis'),{replay:false,analysis:{id:'run'}});
});
