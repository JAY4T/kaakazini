export const AVAILABILITY_CSS = `
/* ── AVAILABILITY ── */
.hcp .avail-pill-busy {
  position: absolute; top: 10px; right: 10px; z-index: 1;
  background: #b45309; color: #fff; border-radius: 50px;
  padding: 3px 9px; font-size: .58rem; font-weight: 700;
  display: flex; align-items: center; gap: 4px;
  box-shadow: 0 2px 8px rgba(180,83,9,.4);
}
.hcp .avail-pill-busy .avail-dot {
  background: #fff; width: 5px; height: 5px;
  border-radius: 50%; animation: none;
}
.hcp .avail-status-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; border-radius: 8px;
  margin-bottom: 8px; font-size: .72rem; font-weight: 700;
}
.hcp .avail-status-bar.online {
  background: #f0fdf4; color: #15803d; border: 1.5px solid #bbf7d0;
}
.hcp .avail-status-bar.busy {
  background: #fffbeb; color: #92400e; border: 1.5px solid #fde68a;
}
.hcp .notify-btn {
  width: 100%; padding: 9px 0; border-radius: 11px;
  font-size: .82rem; font-weight: 800; cursor: pointer;
  border: 2px solid #e2e8f0; background: #f8fafc; color: #64748b;
  font-family: 'Outfit', sans-serif; transition: all .2s;
  display: flex; align-items: center; justify-content: center;
  gap: 7px; margin-top: 4px;
}
.hcp .notify-btn:hover {
  border-color: #FFD700; background: #fef9c3; color: #78350f;
}
.hcp .notify-sent {
  background: #eff6ff; border: 1.5px solid #bfdbfe;
  border-radius: 9px; padding: 9px 14px;
  font-size: .78rem; font-weight: 700; color: #1d4ed8;
  display: flex; align-items: center; gap: 8px; margin-top: 4px;
}
`;