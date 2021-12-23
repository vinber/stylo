import React from 'react'
import { HelpCircle, LogOut } from 'react-feather'
import { useSelector } from 'react-redux'
import { Switch, Route, Link } from 'react-router-dom'

import styles from './header.module.scss'

function Header () {
  const logedIn = useSelector(state => state.logedIn)
  const displayName = useSelector(state => state.activeUser.displayName)
  const backendEndpoint = useSelector(state => state.applicationConfig.backendEndpoint)

  const nav = logedIn ? (
    <>
      <li><Link to="/credentials">{displayName}</Link></li>
      <li><Link to="/books">Books</Link></li>
      <li><Link to="/articles">Articles</Link></li>
      <li><a
        href={backendEndpoint + '/logout'}
        className={styles.logoutAction}
      >
        Log out
        <LogOut className={styles.linkIcon} size={14} />
      </a></li>
    </>
  ) : (
    <>
      <li><Link to="/">Login</Link></li>
      <li><Link to="/register" className={styles.registerAction}>
        Register
      </Link></li>
    </>
  )

  return (<Switch>
    <Route path="*/preview" />
    <Route path="*">
      <header className={styles.headerContainer}>
        <section className={styles.header}>
          <h1 className={styles.logo}>
            <Link to="/">Stylo</Link>
          </h1>
          <nav>
            <ul className={styles.menuLinks}>
              {nav}
              <li className={styles.documentationLink}><a
                href="http://stylo-doc.ecrituresnumeriques.ca"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HelpCircle className={styles.linkIcon} size={14} />
                Documentation
              </a></li>
            </ul>
          </nav>
        </section>
      </header>
    </Route>
  </Switch>)
}

export default Header