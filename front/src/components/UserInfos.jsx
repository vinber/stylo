import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'
import etv from '../helpers/eventTargetValue'
import styles from './credentials.module.scss'
import formStyles from './field.module.scss'
import Button from "./Button";
import Field from "./Field";
import formatTimeAgo from '../helpers/formatTimeAgo';
import Loading from "./Loading";

const mapStateToProps = ({
  password,
  activeUser,
  sessionToken,
  applicationConfig,
}) => {
  return { password, activeUser, sessionToken, applicationConfig }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateActiveUser: (displayName) =>
      dispatch({ type: `UPDATE_ACTIVE_USER`, payload: displayName }),
    removedMyself: (_id) =>
      dispatch({ type: 'REMOVE_MYSELF_ALLOWED_LOGIN', payload: _id }),
    clearZoteroToken: () => dispatch({ type: 'CLEAR_ZOTERO_TOKEN' }),
  }
}

const ConnectedUser = (props) => {
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [institution, setInstitution] = useState('')
  const [yaml, setYaml] = useState('')
  const [user, setUser] = useState({
    email: '',
    _id: '',
    admin: false,
    createdAt: '',
    updatedAt: '',
    zoteroToken: '',
    zoteroUsername: '',
  })
  const [passwords, setPasswords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { clearZoteroToken } = props

  useEffect(() => {
    ;(async () => {
      try {
        const query = `query($user:ID!){user(user:$user){ displayName _id email authType admin createdAt updatedAt yaml firstName zoteroToken lastName institution }}`
        const variables = { user: props.activeUser._id }
        const data = await askGraphQL(
          { query, variables },
          'fetching user',
          props.sessionToken,
          props.applicationConfig
        )
        //setDisplayNameH1(data.user.displayName)
        setDisplayName(data.user.displayName)
        setFirstName(data.user.firstName || '')
        setLastName(data.user.lastName || '')
        setInstitution(data.user.institution || '')
        setYaml(data.user.yaml || '')
        setPasswords(data.user.passwords)
        setUser(data.user)
        setIsLoading(false)
      } catch (err) {
        alert(`couldn't fetch user ${err}`)
      }
    })()
  }, [])

  const unlinkZoteroAccount = async () => {
    const query = `mutation($user:ID!,$zoteroToken:String){updateUser(user:$user, zoteroToken:$zoteroToken){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution zoteroToken passwords{ _id username email } }}`
    const variables = { user: props.activeUser._id, zoteroToken: null }
    setIsLoading(true)
    const data = await askGraphQL(
      { query, variables },
      'clear Zotero Token',
      props.sessionToken,
      props.applicationConfig
    )
    setUser(data.updateUser)
    clearZoteroToken()
    setIsLoading(false)
  }

  const updateInfo = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const query = `mutation($user:ID!,$displayName:String!,$firstName:String,$lastName:String, $institution:String,$yaml:String){updateUser(user:$user,displayName:$displayName,firstName:$firstName, lastName: $lastName, institution:$institution, yaml:$yaml){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution zoteroToken passwords{ _id username email } }}`
      const variables = {
        user: props.activeUser._id,
        yaml,
        displayName,
        firstName,
        lastName,
        institution,
      }
      const data = await askGraphQL(
        { query, variables },
        'updating user',
        props.sessionToken,
        props.applicationConfig
      )
      //setDisplayNameH1(data.updateUser.displayName)
      setDisplayName(data.updateUser.displayName)
      props.updateActiveUser(displayName)
      setFirstName(data.updateUser.firstName || '')
      setLastName(data.updateUser.lastName || '')
      setInstitution(data.updateUser.institution || '')
      setYaml(data.updateUser.yaml || '')
      setPasswords(data.updateUser.passwords)
      setUser(data.updateUser)
      setIsLoading(false)
    } catch (err) {
      alert(`Couldn't update User: ${err}`)
    }
  }

  if (isLoading) {
    return <Loading/>
  }

  return (<>
    <section className={styles.section}>
      <h2>Account information</h2>
      <form onSubmit={(e) => updateInfo(e)}>
        <Field
          id="displayNameField"
          label="Display name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(etv(e))}
          placeholder="Display name"
        />
        <Field
          id="firstNameField"
          label="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(etv(e))}
          placeholder="First name"
        />
        <Field
          id="lastNameField"
          label="Last Name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(etv(e))}
          placeholder="Last name"
        />
        <Field
          id="institutionField"
          label="Institution"
          type="text"
          value={institution}
          onChange={(e) => setInstitution(etv(e))}
          placeholder="Institution name"
        />
        <Field
          label="Zotero"
        >
          <>
            {user.zoteroToken ? (
              <span>
              Linked with <b>{user.zoteroToken}</b> account.
            </span>
            ) : (
              <span>No linked account.</span>
            )}
            {user.zoteroToken && (
              <Button
                title="Unlink this Zotero account"
                onClick={(e) => e.preventDefault() || unlinkZoteroAccount()}
              >
                Unlink
              </Button>
            )}
          </>
        </Field>
        <Field label="Default YAML">
          <textarea
            id="yamlField"
            value={yaml}
            onChange={(e) => setYaml(etv(e))}
            placeholder=""
          />
        </Field>

        <div className={formStyles.footer}>
          <Button primary={true}>Update</Button>
        </div>
      </form>
    </section>

    <section className={styles.section}>
      <Field label="Account email">
        <>{user.email}</>
      </Field>
      <Field label="Account type">
        <>{user.authType === 'oidc' ? 'External (OpenID)' : 'Local'}</>
      </Field>
      <Field label="API Key">
        <code>{props.sessionToken}</code>
      </Field>
      <Field label="Identifier">
        <code>{user._id}</code>
      </Field>
      <Field label="Status">
        <>{user.admin ? 'Admin' : 'Basic account'}</>
      </Field>
      <Field label="Created At">
        <time dateTime={user.createdAt}>{formatTimeAgo(user.createdAt)}</time>
      </Field>
      <Field label="Updated At">
        <time dateTime={user.updatedAt}>{formatTimeAgo(user.updatedAt)}</time>
      </Field>

    </section>
  </>
  )
}

const User = connect(mapStateToProps, mapDispatchToProps)(ConnectedUser)

export default User
