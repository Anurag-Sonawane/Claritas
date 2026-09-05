import { useState } from 'react';
import { Play, RotateCcw, Save, Code2, Terminal as TerminalIcon, Settings } from 'lucide-react';
import { api } from '../services/api';

export default function Compiler() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('function calculatePhysics() {\n  const gravity = 9.81;\n  const mass = 50;\n  \n  // Calculate Force\n  const force = mass * gravity;\n  console.log(`The calculated force is ${force} Newtons.`);\n}\n\ncalculatePhysics();');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('> Transmitting payload to Claritas API Execution Service...\n');

    try {
      const res = await api.runCompiler(code, language);
      setOutput(`> Status: ${res.status} (${res.executionTime})\n> Output:\n${res.output}`);
    } catch (err) {
      setOutput(`> Execution Error:\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode('// Start typing your code here...');
    setOutput('');
  };

  // Generate pseudo-line numbers
  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: Math.max(15, lineCount) }, (_, i) => i + 1);

  return (
    <div style={{ height: 'calc(100vh - 220px)', minHeight: '520px', display: 'flex', flexDirection: 'column', paddingBottom: '16px' }}>
      
      {/* Sandbox Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 12, background: 'rgba(255, 90, 54, 0.1)', borderRadius: 12, color: 'var(--primary)' }}>
            <Code2 size={24} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '1.6rem' }}>Developer Sandbox</h1>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Write, compile, and execute logic natively.</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--foreground)', fontFamily: 'monospace' }}
          >
            <option value="javascript">JavaScript (Node 20)</option>
            <option value="python">Python 3.12</option>
            <option value="cpp">C++ (GCC 13)</option>
            <option value="java">Java 21</option>
          </select>
          <button className="btn-outline" onClick={handleReset} title="Reset Sandbox"><RotateCcw size={16} /></button>
          <button className="btn-outline"><Save size={16} /> Save Snippet</button>
          <button 
            className="btn-primary glow-panel" 
            onClick={handleRun} 
            disabled={isRunning}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', opacity: isRunning ? 0.7 : 1 }}
          >
            <Play size={16} /> {isRunning ? 'Executing...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Split Pane Workspace */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '2fr 1fr', gap: 16, minHeight: 0 }}>
        
        {/* Editor Container */}
        <div className="surface" style={{ borderRadius: 16, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Code2 size={14}/> main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={14} style={{ cursor: 'pointer' }}/></span>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#0e1116' }}>
            {/* Gutter / Pseudo Line Numbers */}
            <div style={{ width: 40, background: '#13161c', borderRight: '1px solid var(--glass-border)', padding: '16px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem', fontFamily: '"Fira Code", "Consolas", monospace', userSelect: 'none' }}>
               {lines.map(l => <div key={l} style={{ lineHeight: 1.5 }}>{l}</div>)}
            </div>

            {/* Textarea */}
            <textarea
              spellCheck="false"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{
                flex: 1, padding: 16, background: 'transparent', border: 'none', color: '#e2e8f0',
                fontFamily: '"Fira Code", "Consolas", monospace', fontSize: '0.9rem', lineHeight: 1.5,
                resize: 'none', outline: 'none', whiteSpace: 'pre'
              }}
            />
          </div>
        </div>

        {/* Terminal Container */}
        <div className="surface" style={{ borderRadius: 16, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>
             <TerminalIcon size={14} /> Output Console
          </div>
          
          <div style={{ flex: 1, padding: 16, background: '#080a0f', color: '#a0aec0', fontFamily: '"Fira Code", "Consolas", monospace', fontSize: '0.85rem', overflowY: 'auto', whiteSpace: 'pre-line' }}>
            {output || <span style={{ opacity: 0.5 }}>Waiting for execution...</span>}
            {isRunning && <span style={{ animation: 'pulse 1s infinite' }}>_</span>}
          </div>
        </div>

      </div>
    </div>
  );
}
