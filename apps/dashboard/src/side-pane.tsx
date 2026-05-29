import { useEffect } from "react";
import type { ReactNode } from "react";

export function SidePane({
  isOpen,
  onClose,
  title,
  subtitle,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="eg-sidepane-backdrop" 
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 45,
          background: "rgba(2, 4, 10, 0.72)",
          backdropFilter: "blur(2px)"
        }}
      />
      <aside 
        className="eg-sidepane"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(100vw, 420px)",
          zIndex: 50,
          background: "rgba(7, 10, 17, 0.98)",
          borderLeft: "1px solid var(--eg-border)",
          boxShadow: "-12px 0 44px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          animation: "eg-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <header 
          style={{
            padding: "1.2rem",
            borderBottom: "1px solid var(--eg-border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem"
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", letterSpacing: "-0.03em" }}>{title}</h3>
            {subtitle ? <p style={{ margin: "0.25rem 0 0", color: "var(--eg-muted)", fontSize: "0.86rem" }}>{subtitle}</p> : null}
          </div>
          <button 
            className="eg-sidebar__close"
            onClick={onClose}
            style={{ flexShrink: 0, marginTop: "-0.2rem" }}
          >
            Close
          </button>
        </header>
        <div style={{ padding: "1.2rem", flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </aside>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes eg-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </>
  );
}
