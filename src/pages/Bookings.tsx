import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Button, Chip, DisabledWhy, Drawer, Modal, UnitTag, type Tone } from '../components/ui';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

type Od = { name: string; bk: string; agent: string; unit: string; inst: string; days: number; amt: string; rem: string };

const OVERDUE: Od[] = [
  { name: 'Asif Mehmood Chaudhry', bk: 'BK-0277', agent: 'Usman T.', unit: 'A-902', inst: 'Q5 of 12', days: 94, amt: 'PKR 18.4 L', rem: 'WhatsApp, 28 Oct · no reply' },
  { name: 'Shazia Parveen', bk: 'BK-0301', agent: 'Sana N.', unit: 'C-604', inst: 'Q4 of 12', days: 71, amt: 'PKR 15.0 L', rem: 'Call by Rashid, 30 Oct' },
  { name: 'Nasir Hussain', bk: 'BK-0412', agent: 'Fahad N.', unit: 'B-1203', inst: 'Q3 of 12', days: 21, amt: 'PKR 12.6 L', rem: 'SMS + WhatsApp, 1 Nov' },
  { name: 'Rizwan Butt (UAE)', bk: 'BK-0433', agent: 'Maryam B.', unit: 'C-1305', inst: 'Q3 of 12', days: 18, amt: 'AED 44,000', rem: 'Email, 31 Oct' },
  { name: 'Kiran Akhtar', bk: 'BK-0451', agent: 'Usman T.', unit: 'B-805', inst: 'Q2 of 12', days: 12, amt: 'PKR 11.9 L', rem: 'Auto reminder, 2 Nov' },
  { name: 'Bilal Ahmed Khan', bk: 'BK-0460', agent: 'Sana N.', unit: 'A-1104', inst: 'Q2 of 12', days: 9, amt: 'PKR 13.2 L', rem: 'Auto reminder, 2 Nov' },
  { name: 'Mehwish Raza', bk: 'BK-0472', agent: 'Fahad N.', unit: 'B-302', inst: 'Q2 of 12', days: 6, amt: 'PKR 8.7 L', rem: 'Auto reminder, 30 Oct' },
  { name: 'Saleem Akhtar', bk: 'BK-0488', agent: 'Maryam B.', unit: 'Shop G-07', inst: 'Q1 of 8', days: 4, amt: 'PKR 28.0 L', rem: 'Auto reminder, 30 Oct' },
  { name: 'Hafsa Noor', bk: 'BK-0490', agent: 'Usman T.', unit: 'A-505', inst: 'Q1 of 12', days: 2, amt: 'PKR 10.4 L', rem: 'Auto reminder, 1 Nov' },
];

const SCHED: { n: string; due: string; amt: string; st: string; tone: Tone }[] = [
  { n: 'Down payment', due: '14 Feb 2026', amt: 'PKR 47.5 L', st: 'Paid', tone: 'ok' },
  { n: 'Q1', due: '15 May 2026', amt: 'PKR 12.6 L', st: 'Paid', tone: 'ok' },
  { n: 'Q2', due: '15 Aug 2026', amt: 'PKR 12.6 L', st: 'Paid', tone: 'ok' },
  { n: 'Q3', due: '13 Oct 2026', amt: 'PKR 12.6 L', st: 'Overdue 21d', tone: 'bad' },
  { n: 'Q4', due: '15 Jan 2027', amt: 'PKR 12.6 L', st: 'Due in 73d', tone: 'warn' },
  { n: 'Q5', due: '15 Apr 2027', amt: 'PKR 12.6 L', st: 'Upcoming', tone: 'neutral' },
];

const RECEIPTS = [
  { rc: 'RC-2291', when: '12 Aug', how: 'Bank transfer (Meezan)', amt: 'PKR 12.6 L' },
  { rc: 'RC-1980', when: '15 May', how: 'Pay order', amt: 'PKR 12.6 L' },
  { rc: 'RC-1544', when: '14 Feb', how: 'Down payment, cheque', amt: 'PKR 47.5 L' },
];

const TABS = [
  { key: 'overdue', label: 'Overdue', n: '23', alert: true },
  { key: 'month', label: 'Due this month', n: '48' },
  { key: 'all', label: 'All bookings', n: '187' },
  { key: 'receipts', label: 'Receipts' },
  { key: 'cheques', label: 'Cheques pending clearance', n: '9' },
];

export function Bookings() {
  const s = useSession();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'overdue';
  const [rows, setRows] = useState(OVERDUE);
  const [selBk, setSelBk] = useState('BK-0412');
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = (bk: string) => {
    setSelBk(bk);
    setDetailOpen(true);
  };
  const [recording, setRecording] = useState<Od | null>(null);
  const canRecord = s.role === 'finance' || s.role === 'admin';
  const sel = rows.find((r) => r.bk === selBk) ?? rows[0];

  const title = s.role === 'dealer' ? 'Commission' : s.role === 'agent' ? 'My bookings' : 'Bookings & instalments';

  const record = (r: Od) => (canRecord ? setRecording(r) : null);

  return (
    <>
      <div className="page-head">
        <h1 className="t-h1">{title}</h1>
        <span className="muted">{s.project} · 187 active bookings</span>
        <span className="spacer" />
        <button type="button" className="btn btn--secondary btn--sm">
          Export ledger
        </button>
        {canRecord ? (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => sel && setRecording(sel)}>
            Record payment
          </button>
        ) : (
          <DisabledWhy reason="Only Finance and Owner/Admin can record payments" size="sm" variant="primary">
            Record payment
          </DisabledWhy>
        )}
      </div>

      <div className="grid-tiles grid-tiles--3">
        <button type="button" className={`kpi ${tab === 'overdue' ? 'is-active' : ''}`} onClick={() => setParams({})}>
          <span className="kpi__label">Overdue now</span>
          <span className="kpi__value">PKR 3.42 Cr</span>
          <span className="kpi__sub danger-text">23 instalments · 6 over 60 days</span>
        </button>
        <button type="button" className={`kpi ${tab === 'month' ? 'is-active' : ''}`} onClick={() => setParams({ tab: 'month' })}>
          <span className="kpi__label">Due in next 30 days</span>
          <span className="kpi__value">PKR 6.18 Cr</span>
          <span className="small text-2">48 instalments · auto-reminders on</span>
        </button>
        <button type="button" className={`kpi ${tab === 'receipts' ? 'is-active' : ''}`} onClick={() => setParams({ tab: 'receipts' })}>
          <span className="kpi__label">Collected in October</span>
          <span className="kpi__value">PKR 4.96 Cr</span>
          <span className="small text-2">81% of scheduled · Sept 88%</span>
        </button>
      </div>

      <section className="panel panel--clip">
          <div role="tablist" className="tabs" aria-label="Booking lists">
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="tab" onClick={() => setParams(t.key === 'overdue' ? {} : { tab: t.key })}>
                {t.label} {t.n && <span className={`tab__n ${t.alert ? 'tab__n--alert' : ''}`}>{t.key === 'overdue' ? rows.length + 14 : t.n}</span>}
              </button>
            ))}
          </div>
          {tab === 'receipts' ? (
            <div className="table-scroll">
              <table className="dt">
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Buyer · booking</th>
                    <th>Method</th>
                    <th className="num">Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...RECEIPTS, { rc: 'RC-2310', when: '2 Nov', how: 'Bank transfer (HBL)', amt: 'PKR 11.9 L' }].map((r) => (
                    <tr key={r.rc}>
                      <td className="strong">
                        {r.rc} <span className="small muted">· {r.when}</span>
                      </td>
                      <td>{r.rc === 'RC-2310' ? 'Kiran Akhtar · BK-0451' : 'Nasir Hussain · BK-0412'}</td>
                      <td className="small">{r.how}</td>
                      <td className="num strong">{r.amt}</td>
                      <td>
                        <a href="#pdf">PDF</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="dt" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>Buyer · booking</th>
                    <th>Instalment</th>
                    <th>{tab === 'overdue' ? 'Overdue ↓' : 'Status'}</th>
                    <th className="num">Amount</th>
                    <th>Last reminder</th>
                    <th style={{ width: 150 }}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'overdue' ? rows : rows.map((r, i) => ({ ...r, days: -((i * 4) % 28) - 2 }))).map((r) => (
                    <tr key={r.bk} className={detailOpen && r.bk === sel?.bk ? 'is-selected' : undefined} onClick={() => openDetail(r.bk)} style={{ cursor: 'pointer' }}>
                      <td>
                        <span className="cell-stack">
                          <button type="button" className="linklike strong ellipsis" style={{ color: 'var(--text)', textAlign: 'left', textDecoration: 'none' }} onClick={() => openDetail(r.bk)}>
                            {r.name}
                          </button>
                          <span className="small muted">
                            {r.bk} · {r.unit} · {r.agent}
                          </span>
                        </span>
                      </td>
                      <td className="small">{r.inst}</td>
                      <td>
                        {r.days > 0 ? (
                          <span className={`age ${r.days > 60 ? 'chip--danger-solid' : 'age--danger'}`} style={{ fontSize: 12, lineHeight: '20px', padding: '0 6px' }}>
                            <Icon name="warn" size={10} stroke={3} />
                            {r.days}d
                          </span>
                        ) : (
                          <Chip tone="warn" icon="clock" small>
                            Due in {-r.days}d
                          </Chip>
                        )}
                      </td>
                      <td className="num strong">{r.amt}</td>
                      <td className="small text-2">{r.rem}</td>
                      <td>
                        <span className="row" style={{ gap: 6, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                          <button type="button" className="btn btn--secondary btn--xs" style={{ height: 32 }} onClick={() => toast({ text: `Reminder sent to ${r.name} on WhatsApp + SMS` })}>
                            Remind
                          </button>
                          {canRecord ? (
                            <button type="button" className="btn btn--primary btn--xs" style={{ height: 32 }} onClick={() => record(r)}>
                              Record
                            </button>
                          ) : (
                            <DisabledWhy reason="Only Finance can record payments" size="xs" variant="primary" lock={false}>
                              Record
                            </DisabledWhy>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      {detailOpen && sel && (
        <Drawer title={`${sel.bk} · ${sel.name}`} sub={<UnitTag>{sel.unit}</UnitTag>} onClose={() => setDetailOpen(false)} footer={<>
              <Button onClick={() => toast({ text: `Statement sent to ${sel.name}` })}>Send statement</Button>
              {s.role === 'admin' ? (
                <Button>Cancel booking</Button>
              ) : (
                <DisabledWhy reason="Cancelling a booking needs Owner/Admin approval" lock={false}>
                  Cancel booking
                </DisabledWhy>
              )}
              {canRecord ? (
                <Button variant="primary" className="btn--fill" onClick={() => setRecording(sel)}>
                  Record payment
                </Button>
              ) : (
                <DisabledWhy reason="Only Finance can record payments" variant="primary" fill>
                  Record payment
                </DisabledWhy>
              )}
            </>}>
          <div className="stack-1" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              
              <span className="small muted">Booked 14 Feb 2026 by {sel.agent.replace('.', '')} · 3-year quarterly plan · CNIC verified</span>
              <div className="grid-tiles grid-tiles--3" style={{ gap: 8, marginTop: 8 }}>
                <div className="kv small">
                  <span>Total price</span>
                  <b style={{ fontSize: 14 }}>PKR 2.02 Cr</b>
                </div>
                <div className="kv small">
                  <span>Received</span>
                  <b style={{ fontSize: 14 }}>PKR 72.7 L</b>
                </div>
                <div className="kv small">
                  <span>Overdue</span>
                  <b style={{ fontSize: 14, color: 'var(--danger)' }}>{sel.amt}</b>
                </div>
              </div>
              <span className="track" style={{ marginTop: 6, display: 'flex' }} role="img" aria-label="36% paid, 6% overdue">
                <span style={{ width: '36%', borderRadius: 0 }} />
                <span style={{ width: '6%', borderRadius: 0, background: 'var(--danger)' }} />
              </span>
            </div>
            <div className="t-label" style={{ paddingTop: 4 }}>
              Payment schedule
            </div>
            <div style={{ margin: '0 -8px' }}>
              {SCHED.map((x) => (
                <div key={x.n} className="sched-row">
                  <span className="strong">{x.n}</span>
                  <span className="text-2">{x.due}</span>
                  <span className="right">{x.n === 'Q3' ? sel.amt : x.amt}</span>
                  <span style={{ justifySelf: 'end' }}>
                    <Chip tone={x.tone} small icon={x.tone === 'ok' ? 'check' : x.tone === 'bad' ? 'warn' : x.tone === 'warn' ? 'clock' : 'dot'}>
                      {x.n === 'Q3' ? `Overdue ${sel.days}d` : x.st}
                    </Chip>
                  </span>
                </div>
              ))}
              <div className="small muted" style={{ padding: 8 }}>
                + 6 more instalments to Feb 2029 · Possession charges PKR 10.1 L
              </div>
            </div>
            <div className="t-label" >
              Receipts
            </div>
            <div className="stack-2 small" style={{ gap: 6 }}>
              {RECEIPTS.map((r) => (
                <div key={r.rc} className="row">
                  <span className="spacer">
                    {r.rc} · {r.when} · {r.how}
                  </span>
                  <b>{r.amt}</b>
                  <a href="#pdf">PDF</a>
                </div>
              ))}
            </div>
            
        </Drawer>
      )}

      {recording && (
        <Modal
          title={`Record payment · ${recording.bk}`}
          sub={`${recording.name} · ${recording.unit} · ${recording.inst}`}
          onClose={() => setRecording(null)}
          actions={
            <>
              <Button onClick={() => setRecording(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  const r = recording;
                  setRows((xs) => xs.filter((x) => x.bk !== r.bk));
                  setRecording(null);
                  toast({ text: `${r.amt} recorded for ${r.name} · receipt issued`, action: { label: 'Undo', onClick: () => setRows((xs) => [...xs, r].sort((a, b) => b.days - a.days)) } });
                }}
              >
                Record and issue receipt
              </Button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="rp-amt" className="field__label">
              Amount
            </label>
            <input id="rp-amt" className="input" defaultValue={recording.amt} />
          </div>
          <div className="field">
            <label htmlFor="rp-method" className="field__label">
              Method
            </label>
            <select id="rp-method" className="select">
              <option>Bank transfer</option>
              <option>Pay order</option>
              <option>Cheque (pending clearance)</option>
              <option>Roshan Digital Account</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="rp-ref" className="field__label">
              Bank reference
            </label>
            <input id="rp-ref" className="input" placeholder="e.g. MZN-88213" />
          </div>
        </Modal>
      )}
    </>
  );
}
