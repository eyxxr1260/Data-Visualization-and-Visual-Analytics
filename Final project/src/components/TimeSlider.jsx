import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import './TimeSlider.css';


function TimeSlider({ 
  currentIndex, 
  setCurrentIndex, 
  maxIndex, 
  selectedYear, 
  selectedWeek,
  isPlaying,
  setIsPlaying
}) {
  // If you move the slider manually, we pause:
  const handleSliderChange = (e) => {
    const val = +e.target.value;
    setCurrentIndex(val);
    // Optional: Pause if the user moves the slider
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div>
        <strong>Year:</strong> {selectedYear} 
        &nbsp; | &nbsp;
        <strong>Week:</strong> {selectedWeek}
      </div>

      <input
        type="range"
        min={0}
        max={maxIndex}
        value={currentIndex}
        onChange={handleSliderChange}
        style={{ width: '80%', margin: '0.5rem 0' }}
      />

      <div>
        {/* <button onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button> */}
        <button className="play-pause-btn" onClick={handlePlayPause}>
          {isPlaying ? (
            <FontAwesomeIcon icon={faPause} />
          ) : (
            <FontAwesomeIcon icon={faPlay} />
          )}
        </button>

      </div>
    </div>
  );
}

export default TimeSlider;
