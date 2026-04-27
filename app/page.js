'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getWords } from './words'
import styles from './page.module.css'

const DURATIONS = [15, 30, 60]
const LANGS = [{ id: 'ko', label: '한국어' }, { id: 'en', label: 'English' }]
const DIFFICULTIES = [
  { id: 'easy', label: '쉬움', count: 20 },
  { id: 'normal', label: '보통', count: 30 },
  { id: 'hard', label: '어려움', count: 50 },
]

export default function TypingTest() {
  const [lang, setLang] = useState('en')
  const [duration, setDuration] = useState(30)
  const [difficulty, setDifficulty] = useState('normal')

  const [words, setWords] = useState([])
  const [input, setInput] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charStatuses, setCharStatuses] = useState([]) // per word: array of 'correct'|'wrong'|''
  const [state, setState] = useState('idle') // idle | running | done
  const [timeLeft, setTimeLeft] = useState(30)
  const [history, setHistory] = useState([])

  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const correctCharsRef = useRef(0)
  const wrongWordsRef = useRef(0)
  const wordsContainerRef = useRef(null)
  const activeWordRef = useRef(null)

  const diff = DIFFICULTIES.find(d => d.id === difficulty)

  const init = useCallback(() => {
    const w = getWords(lang, diff.count)
    setWords(w)
    setInput('')
    setWordIdx(0)
    setCharStatuses(w.map(() => []))
    setState('idle')
    setTimeLeft(duration)
    correctCharsRef.current = 0
    wrongWordsRef.current = 0
    clearInterval(timerRef.current)
  }, [lang, duration, difficulty])

  useEffect(() => { init() }, [init])

  // scroll active word into view
  useEffect(() => {
    if (activeWordRef.current && wordsContainerRef.current) {
      const container = wordsContainerRef.current
      const word = activeWordRef.current
      const wTop = word.offsetTop
      const cScroll = container.scrollTop
      const cHeight = container.clientHeight
      if (wTop > cScroll + cHeight - 60) {
        container.scrollTo({ top: wTop - 40, behavior: 'smooth' })
      }
    }
  }, [wordIdx])

  function startTimer() {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          finish()
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  function finish() {
    setState('done')
    clearInterval(timerRef.current)
  }

  function handleInput(e) {
    const val = e.target.value

    if (state === 'idle') {
      setState('running')
      startTimer()
    }
    if (state === 'done') return

    // space = submit word
    if (val.endsWith(' ')) {
      const typed = val.trim()
      const target = words[wordIdx]
      const statuses = target.split('').map((ch, i) => {
        if (i >= typed.length) return 'missing'
        return typed[i] === ch ? 'correct' : 'wrong'
      })
      // extra chars
      if (typed.length > target.length) {
        for (let i = target.length; i < typed.length; i++) statuses.push('extra')
      }

      const isCorrect = typed === target
      if (isCorrect) correctCharsRef.current += target.length + 1
      else wrongWordsRef.current++

      setCharStatuses(prev => {
        const next = [...prev]
        next[wordIdx] = statuses
        return next
      })

      if (wordIdx + 1 >= words.length) {
        finish()
        return
      }
      setWordIdx(i => i + 1)
      setInput('')
    } else {
      setInput(val)
    }
  }

  function getWPM() {
    const elapsed = duration - timeLeft || 1
    return Math.round((correctCharsRef.current / 5) / (elapsed / 60))
  }

  function getAccuracy() {
    const total = wordIdx + wrongWordsRef.current
    if (total === 0) return 100
    return Math.round(((total - wrongWordsRef.current) / total) * 100)
  }

  function handleDone() {
    const result = { wpm: getWPM(), acc: getAccuracy(), lang, duration, difficulty, time: new Date().toLocaleTimeString() }
    setHistory(h => [result, ...h].slice(0, 5))
    setState('result')
  }

  useEffect(() => {
    if (state === 'done') handleDone()
  }, [state])

  function focusInput() { inputRef.current?.focus() }

  const wpm = state === 'running' ? getWPM() : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.logo}>⌨ typist</span>
        <div className={styles.controls}>
          <div className={styles.group}>
            {LANGS.map(l => (
              <button key={l.id} className={`${styles.chip} ${lang === l.id ? styles.active : ''}`}
                onClick={() => setLang(l.id)} disabled={state === 'running'}>
                {l.label}
              </button>
            ))}
          </div>
          <div className={styles.group}>
            {DURATIONS.map(d => (
              <button key={d} className={`${styles.chip} ${duration === d ? styles.active : ''}`}
                onClick={() => setDuration(d)} disabled={state === 'running'}>
                {d}s
              </button>
            ))}
          </div>
          <div className={styles.group}>
            {DIFFICULTIES.map(d => (
              <button key={d.id} className={`${styles.chip} ${difficulty === d.id ? styles.active : ''}`}
                onClick={() => setDifficulty(d.id)} disabled={state === 'running'}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state === 'result' ? (
        <div className={styles.result}>
          <p className={styles.resultTitle}>결과</p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <p className={styles.statVal}>{history[0]?.wpm}</p>
              <p className={styles.statLabel}>WPM</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statVal}>{history[0]?.acc}%</p>
              <p className={styles.statLabel}>정확도</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statVal}>{wordIdx}</p>
              <p className={styles.statLabel}>단어</p>
            </div>
          </div>
          <button className={styles.restartBtn} onClick={init}>다시 시작</button>

          {history.length > 1 && (
            <div className={styles.historyBox}>
              <p className={styles.histTitle}>기록</p>
              <table className={styles.table}>
                <thead>
                  <tr><th>WPM</th><th>정확도</th><th>시간</th><th>언어</th></tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td>{h.wpm}</td>
                      <td>{h.acc}%</td>
                      <td>{h.duration}s</td>
                      <td>{h.lang}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.testArea} onClick={focusInput}>
          <div className={styles.meta}>
            <span className={`${styles.timer} ${timeLeft <= 5 ? styles.urgent : ''}`}>{timeLeft}</span>
            {state === 'running' && <span className={styles.liveWpm}>{wpm} wpm</span>}
          </div>

          <div className={styles.wordsWrap} ref={wordsContainerRef}>
            {words.map((word, wi) => {
              const statuses = charStatuses[wi] || []
              const isCurrent = wi === wordIdx
              const isDone = wi < wordIdx
              return (
                <span
                  key={wi}
                  ref={isCurrent ? activeWordRef : null}
                  className={`${styles.word} ${isCurrent ? styles.currentWord : ''} ${isDone && statuses.every(s => s === 'correct') ? styles.wordCorrect : isDone ? styles.wordWrong : ''}`}
                >
                  {word.split('').map((ch, ci) => {
                    const s = statuses[ci]
                    return (
                      <span key={ci} className={
                        s === 'correct' ? styles.correct :
                        s === 'wrong' || s === 'missing' ? styles.wrong :
                        s === 'extra' ? styles.extra : ''
                      }>
                        {isCurrent && ci === input.length && <span className={styles.caret} />}
                        {ch}
                      </span>
                    )
                  })}
                  {isCurrent && input.length > word.length && (
                    <span className={styles.extra}>{input.slice(word.length)}</span>
                  )}
                  {isCurrent && input.length === word.length && (
                    <span className={styles.caretEnd} />
                  )}
                </span>
              )
            })}
          </div>

          <input
            ref={inputRef}
            className={styles.hiddenInput}
            value={input}
            onChange={handleInput}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          {state === 'idle' && (
            <p className={styles.hint}>클릭 후 타이핑을 시작하세요</p>
          )}
        </div>
      )}
    </div>
  )
}
