import https from 'https';
import fs from 'fs';

const PROJECT = 'xpzxbsgkxtrcgliyavqs';
const TOKEN = 'sbp_bdd9dea3788c8775f8d960bec515d47910b1a459';

function query(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const cols = await query(`
  SELECT c.table_name, c.column_name, c.udt_name, c.character_maximum_length,
         c.is_nullable, c.column_default, c.ordinal_position
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  ORDER BY c.table_name, c.ordinal_position;
`);

const pks = await query(`
  SELECT tc.table_name, kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public';
`);

const fks = await query(`
  SELECT tc.table_name, tc.constraint_name, kcu.column_name,
         ccu.table_name AS ref_table, ccu.column_name AS ref_col
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  ORDER BY tc.table_name;
`);

const uniques = await query(`
  SELECT tc.table_name, tc.constraint_name,
         string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as cols
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
  GROUP BY tc.table_name, tc.constraint_name
  ORDER BY tc.table_name;
`);

const indexes = await query(`
  SELECT indexname, tablename, indexdef
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'
    AND indexname NOT LIKE '%_key'
  ORDER BY tablename, indexname;
`);

const policies = await query(`
  SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
`);

const triggers = await query(`
  SELECT trigger_name, event_manipulation, event_object_table, action_statement, action_timing
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  ORDER BY event_object_table, trigger_name;
`);

const functions = await query(`
  SELECT p.proname as name, pg_get_functiondef(p.oid) as def
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  ORDER BY p.proname;
`);

// Group columns by table
const tableMap = {};
cols.forEach(c => {
  if (!tableMap[c.table_name]) tableMap[c.table_name] = [];
  tableMap[c.table_name].push(c);
});

const pkMap = {};
pks.forEach(p => pkMap[p.table_name] = p.column_name);

const typeMap = {
  uuid: 'uuid', text: 'text', varchar: 'varchar', int4: 'integer', int8: 'bigint',
  bool: 'boolean', timestamptz: 'timestamptz', timestamp: 'timestamp',
  date: 'date', time: 'time', jsonb: 'jsonb', numeric: 'numeric', int2: 'smallint',
};

const tableOrder = [
  'schools', 'school_domains', 'roles', 'capabilities', 'role_capabilities',
  'user_profiles', 'user_roles',
  'teachers', 'parents', 'students', 'student_parents',
  'courses', 'classes', 'enrollments', 'schedule_slots', 'class_sessions',
  'attendance_records',
  'notif_templates', 'notifications', 'notif_events', 'notif_queue',
  'notif_delivery_log', 'notif_subscriptions',
];

let sql = `-- ============================================================
-- YayaMusic CRM — Master Migration (production snapshot)
-- Project: ${PROJECT}
-- Generated: ${new Date().toISOString()}
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

`;

tableOrder.forEach(tbl => {
  const tcols = tableMap[tbl];
  if (!tcols) return;
  const pk = pkMap[tbl];
  const colDefs = tcols.map(c => {
    let def = '  ' + c.column_name + ' ';
    def += typeMap[c.udt_name] || c.udt_name;
    if (c.character_maximum_length) def += '(' + c.character_maximum_length + ')';
    if (c.column_name === pk) def += ' PRIMARY KEY';
    if (c.is_nullable === 'NO' && c.column_name !== pk) def += ' NOT NULL';
    if (c.column_default) def += ' DEFAULT ' + c.column_default;
    return def;
  });
  sql += `CREATE TABLE IF NOT EXISTS public.${tbl} (\n${colDefs.join(',\n')}\n);\n\n`;
});

sql += `-- ============================================================
-- UNIQUE CONSTRAINTS
-- ============================================================

`;
uniques.forEach(u => {
  sql += `ALTER TABLE public.${u.table_name} ADD CONSTRAINT ${u.constraint_name} UNIQUE (${u.cols});\n`;
});

sql += `
-- ============================================================
-- FOREIGN KEYS
-- ============================================================

`;
fks.forEach(f => {
  sql += `ALTER TABLE public.${f.table_name} ADD CONSTRAINT ${f.constraint_name} FOREIGN KEY (${f.column_name}) REFERENCES public.${f.ref_table}(${f.ref_col});\n`;
});

sql += `
-- ============================================================
-- INDEXES
-- ============================================================

`;
indexes.forEach(i => sql += i.indexdef + ';\n');

sql += `
-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

`;
const seenFn = new Set();
functions.forEach(f => {
  if (!seenFn.has(f.name)) {
    sql += f.def + '\n\n';
    seenFn.add(f.name);
  }
});

const seenTrig = new Set();
triggers.forEach(t => {
  const key = t.trigger_name + '_' + t.event_object_table;
  if (!seenTrig.has(key)) {
    sql += `-- Trigger: ${t.trigger_name} on ${t.event_object_table}\n`;
    sql += t.action_statement + '\n\n';
    seenTrig.add(key);
  }
});

sql += `
-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

`;
const rlsTables = [
  'schools', 'school_domains', 'user_profiles', 'user_roles', 'roles', 'capabilities',
  'role_capabilities', 'teachers', 'parents', 'students', 'student_parents', 'courses',
  'classes', 'enrollments', 'schedule_slots', 'class_sessions', 'attendance_records',
  'notifications', 'notif_events', 'notif_queue', 'notif_delivery_log',
  'notif_subscriptions', 'notif_templates',
];
rlsTables.forEach(t => sql += `ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;\n`);

sql += '\n';
policies.forEach(p => {
  sql += `CREATE POLICY "${p.policyname}" ON public.${p.tablename}\n  AS ${p.permissive} FOR ${p.cmd} TO ${p.roles}\n  USING (${p.qual || 'true'});\n`;
  if (p.with_check) sql += `-- WITH CHECK: ${p.with_check}\n`;
  sql += '\n';
});

const outPath = 'd:/CRM Education/supabase/migrations/00000000000000_master_schema.sql';
fs.writeFileSync(outPath, sql);
console.log('Done! Lines:', sql.split('\n').length, '| File:', outPath);
