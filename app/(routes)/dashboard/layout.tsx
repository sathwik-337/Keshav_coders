import React from 'react'

function Dashboardlayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
  return (
    <div>{children}</div>
  )
}

export default Dashboardlayout