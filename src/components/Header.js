import React from 'react'

function Header({pageTitle, logoSrc}) {
  return (
    <div className='App-header'>
      <img src={logoSrc} alt='logo' className='App-logo'></img>
      <h1 className='App-title'>{pageTitle}</h1>
    </div>
  )
}

export default Header