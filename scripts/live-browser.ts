import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { readConfig } from '../src/config.js';
const config = readConfig();
if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) throw new Error('Configure a confirmed test account first.');
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900}});
let decisionId: string | undefined;
page.on('response', async response => {
  if (response.request().method()==='POST' && new URL(response.url()).pathname==='/api/decisions' && response.status()===201) {
    const value=await response.json(); decisionId=value.data.id;
  }
});
try {
  const {name,...input}=JSON.parse(await readFile('tests/evaluation-cases.json','utf8'))[3];
  await page.goto(config.APP_ORIGIN);
  await page.getByLabel('Email',{exact:true}).fill(process.env.TEST_EMAIL);
  await page.getByLabel('Password',{exact:true}).fill(process.env.TEST_PASSWORD);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('accountStatus')?.textContent?.startsWith('Signed in as'),{},{timeout:20000});
  await page.getByLabel('Decision or Question').fill(input.decision);
  await page.getByLabel('Context & Background').fill(input.context);
  await page.getByLabel('Reasons Favouring Current Preference').fill(input.reasons);
  await page.getByRole('button',{name:'EXAMINE DECISION'}).click();
  await page.locator('#analysis-output.visible').waitFor({timeout:65000});
  assert.ok((await page.locator('#analysisMeta').innerText()).includes('gemini'));
  assert.ok(decisionId);
  await page.reload();
  await page.locator('#historyList').getByRole('button',{name:input.decision,exact:true}).first().click();
  await page.locator('#analysisHistory button').first().click();
  await page.locator('#analysis-output.visible').waitFor();
  assert.ok((await page.locator('#summaryGrid').innerText()).includes('bicycle'));
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Delete decision',exact:true}).click();
  await page.waitForFunction(()=>document.getElementById('notice')?.textContent?.includes('deleted'));
  decisionId=undefined;
  console.log('LIVE browser sign-in, save, Gemini analysis, refresh, history, and deletion passed.');
} catch {
  console.error('Live browser workflow failed. No credentials or page content are logged.'); process.exitCode=1;
} finally {
  await browser.close();
  if (decisionId) {
    const client=createClient(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
    const {data,error}=await client.auth.signInWithPassword({email:process.env.TEST_EMAIL,password:process.env.TEST_PASSWORD});
    if (!error && data.session) {
      const result=await fetch(`${config.APP_ORIGIN}/api/decisions/${decisionId}`,{method:'DELETE',headers:{Authorization:`Bearer ${data.session.access_token}`}});
      console.log(result.ok?'Test-owned browser decision cleaned up.':'Test cleanup failed; inspect the test account archive.');
      await client.auth.signOut();
    } else console.log('Test cleanup requires signing into the test account archive.');
  }
}
