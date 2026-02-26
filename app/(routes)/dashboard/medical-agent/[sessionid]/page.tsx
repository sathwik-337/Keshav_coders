'use client';
import React from 'react'
import { useParams } from 'next/navigation';
function MedicalVoiceAgent() {
  const {sessionId} = useParams();
  const GetSessionDetails=()=>
  {
    
  }
  return (
    <div> {sessionId}</div>
  )
}

export default  MedicalVoiceAgent