import { useState, useRef } from 'react'
import './App.css'

function App() {  
  const [timer, setTimer] = useState({break: 300, session: 1500, title: "Session"});
  const [timeDisplay, setTimeDisplay] = useState(timer.session);
  // refs for setInterval ID and to see outside setInterval closure
  let intID = useRef(null);
  let timeRef = useRef(timeDisplay);
  let titleRef = useRef('Session');
  
  function handleAdjust(ticker, tick) {
    if (timeRef.current < 60) { // remove effects when counter is ticked during countdown
      const timeEl = document.getElementById('time-left');
      const displayEl = document.getElementById('display');
      timeEl.classList.remove('shake');
      displayEl.classList.remove('shade');
    }
    // clear interval and reset title to default on counter tick
    clearInterval(intID.current);
    intID.current = null;
    titleRef.current = 'Session';
    // handle break counter tick
    if (ticker === 'break') {
      if (tick === 'up') {
        if (timer.break === 3600) return; // don't allow more than 60 min
        setTimer({...timer, break: timer.break + 60, title: 'Session'});
      } else {
        if (timer.break === 60) return; // don't allow less than 1 min
        setTimer({...timer, break: timer.break - 60, title: 'Session'});
      }
      // reset time ref and display on counter tick
      setTimeDisplay(timer.session);
      timeRef.current = timer.session;
    // handle break counter tick - display and time ref must stay in sync and begin based off the timer session state
    } else { 
      if (tick === 'up') {
        if (timer.session === 3600) return; // don't allow more than 60 min 
        setTimer({...timer, session: timer.session + 60, title: 'Session'});
        setTimeDisplay(timer.session + 60);
        timeRef.current = timer.session + 60;
      } else {
        // don't allow less than 1 min on session
        if (timer.session === 60) { 
          // if seesion counter is ticked during timing under 60 sec, remove effects
          setTimer({...timer, session: timer.session, title: 'Session'});
          setTimeDisplay(timer.session);
          timeRef.current = timer.session;
          return;
        }
        setTimer({...timer, session: timer.session - 60, title: 'Session'});
        setTimeDisplay(timer.session - 60);
        timeRef.current = timer.session - 60;
      }
    }
  }
  
  function handleReset() {
    clearInterval(intID.current); // clear interval 
    intID.current = null; // clear int ID in ref bc it is used as a boolean in handleStartStop
    // reset to default
    setTimer({...timer, break: 300, session: 1500, title: 'Session'}); 
    setTimeDisplay(1500);
    timeRef.current = 1500;
    // pause audio and loop to beginning in case reset is clicked during audio play
    const audio = document.getElementById("beep");
    audio.pause();
    audio.currentTime = 0;
    // remove effects on reset
    const timeEl = document.getElementById('time-left');
    const displayEl = document.getElementById('display');
    timeEl.classList.remove('shake');
    displayEl.classList.remove('shade');
  }
  
    function handleStartStop() {
    if (!intID.current) {
      clearInterval(intID.current);
      intID.current = setInterval(updateTime, 1000);
    } else {
      clearInterval(intID.current);
      intID.current = null;
      document.getElementById('time-left').classList.remove('shake');
    }
  }
  
  function updateTime() {
    // grab elements to add effects
    const timeEl = document.getElementById('time-left');
    const displayEl = document.getElementById('display');
    // set effects for under 60 seconds
    if (timeRef.current < 61) {
      timeEl.classList.add('shake');
      displayEl.classList.add('shade');
    } 
    // on time 0: switch btwn break and session and update effects, title, time
    if (timeRef.current === 0) {
      playSound();
      timeEl.classList.remove('shake');
      displayEl.classList.remove('shade');
      if (titleRef.current === 'Session') { // setInterval needs to watch a ref to see when to update bc it can only 'see' the initial state passed to its 'enclosure' not any changes made
        setTimer({...timer, title: 'Break'});
        titleRef.current = 'Break';
        setTimeDisplay(timer.break);
        timeRef.current = timer.break;
        return;
      } else {
        setTimer({...timer, title: 'Session'});
        titleRef.current = 'Session';
        setTimeDisplay(timer.session);
        timeRef.current = timer.session;
        return;
      }
    }
    // lastly, decrement the displayed time and the time ref
    setTimeDisplay(t => t - 1);
    timeRef.current--;
  }
  
  function playSound() {
    const audio = document.getElementById("beep");
    audio.play();
  }
  
  return (
    <>
      <h1 id='title'>Timer</h1>
      <Adjusters 
        timer={timer}
        adjust={handleAdjust}/>
      <Display 
        timer={timer} 
        timeLeft={timeDisplay}/>
      <Buttons 
        startStop={handleStartStop} 
        reset={handleReset}/>
    </>
  );
}

function Adjusters({ timer, adjust }) {
  return (
    <div id='container'>
      <div id='break'>
        <h2 id='break-label'>Break Length</h2>
        <button id='break-decrement' onClick={() => adjust('break', 'down')}><i className="fa fa-minus"></i></button>
        <p id='break-length'>{timer.break/60}</p>
        <button id='break-increment' onClick={() => adjust('break', 'up')}><i className="fa fa-plus"></i></button>
      </div>
      <div id='session'>
        <h2 id='session-label'>Session Length</h2>
        <button id='session-decrement' onClick={() => adjust('session', 'down')}><i className="fa fa-minus"></i></button>
        <p id='session-length'>{timer.session/60}</p>
        <button id='session-increment' onClick={() => adjust('session', 'up')}><i className="fa fa-plus"></i></button>
      </div>
    </div>
  )
}

function Display({ timer, timeLeft }) {
  function formatTime(seconds) {
    let min = Math.floor(seconds/60).toString();
    let sec = Math.round(seconds - (min * 60)).toString();
    return (min.padStart(2, '0') + ':' + sec.padStart(2, '0'));
  }
  return (
    <div id="display">
      <h2 id='timer-label'>{timer.title}</h2>
      <p id='time-left'>{formatTime(timeLeft)}</p>
      <audio
        className="clip" 
        id="beep" 
        src="https://sampleswap.org/samples-ghost/INSTRUMENTS%20(SINGLE%20SAMPLES)/Synth/115[kb]round-2.wav.mp3"
      ></audio>
    </div>
  )
}

function Buttons({ startStop, reset }) {
  return (
    <div id='buttons'>
      <button id='start_stop' onClick={startStop}><i className="fa fa-jet-fighter"></i> <i className="fa fa-pause"></i></button>
      <button id='reset' onClick={reset}><i className="fa fa-arrow-rotate-right"></i></button>
    </div>
  )
}

export default App
