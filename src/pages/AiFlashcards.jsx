import { useState } from 'react';
import { Sparkles, LayoutDashboard, Shuffle, ArrowLeft, ArrowRight, ArrowLeft as BackIcon, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function AiFlashcards() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const generateCards = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.generateFlashcards(topic, 5);
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setErrorMsg('Could not generate cards for this topic. Please provide more detail.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const shuffleDeck = () => {
    if (!cards) return;
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
        <BackIcon size={16} /> Back to AI Hub
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, color: '#3b82f6' }}>
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>AI Flashcard Generator</h1>
          <span className="text-muted">Dynamic spaced-repetition deck builder backed by Claritas AI API.</span>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 8, color: '#ef4444', maxWidth: 600, margin: '0 auto 24px auto' }}>
          {errorMsg}
        </div>
      )}

      {!cards ? (
        <div className="surface" style={{ padding: 40, borderRadius: 16, border: '1px solid var(--border)', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 16px 0' }}>What do you want to study?</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32 }}>Input a topic, exam domain, or question area to generate your smart flashcard deck.</p>
          
          <textarea 
            placeholder="e.g. Asymptotic Big-O Analysis, Binary Search Trees, or Virtual Memory Paging..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            style={{ width: '100%', padding: '16px', background: 'var(--background)', border: '1px solid var(--glass-border)', borderRadius: 12, color: 'var(--foreground)', height: 120, resize: 'none', marginBottom: 24 }}
          />

          <button 
            onClick={generateCards}
            disabled={loading || !topic.trim()}
            style={{ width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: (loading || !topic.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !topic.trim()) ? 0.7 : 1 }}
          >
            {loading ? 'Synthesizing knowledge nodes...' : <><Sparkles size={18}/> Generate Deck</>}
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 24, fontSize: '0.9rem', color: 'var(--muted)', alignItems: 'center' }}>
             <span>Deck: {topic}</span>
             <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
               <span>Card {currentIndex + 1} of {cards.length}</span>
               <button className="btn-outline btn-sm" onClick={() => setCards(null)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                 <RotateCcw size={12} /> New Topic
               </button>
             </div>
           </div>

           {/* 3D Flip Container */}
           <div 
             style={{ 
               width: '100%', 
               height: 350, 
               perspective: 1000,
               cursor: 'pointer'
             }}
             onClick={() => setIsFlipped(!isFlipped)}
           >
             <div style={{
               width: '100%',
               height: '100%',
               position: 'relative',
               transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
               transformStyle: 'preserve-3d',
               transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)'
             }}>
               
               {/* Front (Question) */}
               <div className="surface" style={{
                 position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                 borderRadius: 16, border: '2px solid rgba(59, 130, 246, 0.3)', display: 'flex', flexDirection: 'column',
                 alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center'
               }}>
                 <div style={{ fontSize: '0.8rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24, fontWeight: 'bold' }}>
                   Question ({cards[currentIndex].difficulty || 'Core'})
                 </div>
                 <h2 style={{ fontSize: '1.4rem', margin: 0, lineHeight: 1.4 }}>{cards[currentIndex].q}</h2>
                 <div style={{ position: 'absolute', bottom: 24, fontSize: '0.8rem', color: 'var(--muted)' }}>Click card to flip</div>
               </div>

               {/* Back (Answer) */}
               <div className="surface" style={{
                 position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                 borderRadius: 16, border: '2px solid var(--border)', display: 'flex', flexDirection: 'column',
                 alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center',
                 transform: 'rotateX(180deg)'
               }}>
                 <div style={{ fontSize: '0.8rem', color: '#22c55e', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24, fontWeight: 'bold' }}>Answer</div>
                 <p style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.6, color: 'var(--foreground)' }}>{cards[currentIndex].a}</p>
                 <div style={{ position: 'absolute', bottom: 24, fontSize: '0.8rem', color: 'var(--muted)' }}>Click card to flip back</div>
               </div>

             </div>
           </div>

           {/* Controls */}
           <div style={{ display: 'flex', gap: 16, marginTop: 40, width: '100%', justifyContent: 'center' }}>
             <button className="btn-outline" onClick={prevCard} disabled={currentIndex === 0} style={{ padding: '12px 24px' }}>
               <ArrowLeft size={20} />
             </button>
             <button className="btn-outline" onClick={shuffleDeck} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
               <Shuffle size={18} /> Shuffle
             </button>
             <button className="btn-outline" onClick={nextCard} disabled={currentIndex === cards.length - 1} style={{ padding: '12px 24px' }}>
               <ArrowRight size={20} />
             </button>
           </div>
        </div>
      )}
    </div>
  );
}
