import React from 'react'
import CameraCapture from './components/CameraCapture'

const ScanFace = () => {
  return (
    <div className='min-h-[80vh] my-4 overflow-y-auto'>
        Scan the Face To access the website
      <CameraCapture/>
    </div>
  )
}

export default ScanFace
