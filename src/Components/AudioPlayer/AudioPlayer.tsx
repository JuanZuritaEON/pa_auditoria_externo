import React from 'react'
import './AudioPlayer.css'

const AudioPlayer = ({fileName, controls = true, src}: {fileName: string; controls?: boolean; src: string}) => {
  return (
    <div className='content'>
      <span>{fileName}</span>
      <audio controls={controls} controlsList="nodownload" src={src}>
        <track default kind="captions" />
      </audio>
    </div>
  )
}

export default AudioPlayer