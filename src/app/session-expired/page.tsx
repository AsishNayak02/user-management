import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div>
      <span className="">
        <Link href="/login" className="underline text-blue-800">Click here</Link>
        &nbsp;to go to Login Page
      </span>
    </div>
  )
}

export default page