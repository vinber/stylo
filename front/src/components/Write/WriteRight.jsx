import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import styles from './writeRight.module.scss'
import YamlEditor from './yamleditor/YamlEditor'
import NavTag from '../NavTab'
import YAML from 'js-yaml'

export default function WriteRight({ handleYaml, readOnly, yaml }) {
  const dispatch = useDispatch()
  const expanded = useSelector(
    (state) => state.articlePreferences.expandSidebarRight
  )
  const selector = useSelector(
    (state) => state.articlePreferences.metadataFormMode
  )

  const [rawYaml, setRawYaml] = useState(yaml)
  const [error, setError] = useState('')

  const toggleExpand = useCallback(
    () =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'expandSidebarRight',
      }),
    []
  )
  const setSelector = useCallback(
    (value) =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'metadataFormMode',
        value,
      }),
    []
  )

  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <nav
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        {expanded ? 'close' : 'Metadata'}
      </nav>
      {expanded && (
        <div className={styles.yamlEditor}>
          <header>
            <h1>Metadata</h1>
          </header>
          <NavTag
            defaultValue={selector}
            onChange={setSelector}
            items={[
              {
                value: 'basic',
                name: 'Basic Mode',
              },
              {
                value: 'editor',
                name: 'Editor Mode',
              },
              {
                value: 'raw',
                name: 'Raw Mode',
              },
            ]}
          />
          {selector === 'raw' && (
            <>
              {error !== '' && <p className={styles.error}>{error}</p>}
              <textarea
                className={styles.rawYaml}
                value={rawYaml}
                wrap="off"
                rows={20}
                onChange={(event) => {
                  const component = event.target
                  const yaml = component.value
                  try {
                    YAML.loadAll(yaml)
                    setError('')
                    handleYaml(yaml)
                  } catch (err) {
                    setError(err.message)
                  } finally {
                    setRawYaml(yaml)
                  }
                }}
              />
            </>
          )}
          {selector !== 'raw' && readOnly && (
            <YamlEditor
              yaml={yaml}
              basicMode={selector === 'basic'}
              error={(reason) => {
                setError(reason)
                if (reason !== '') {
                  setSelector('raw')
                }
              }}
            />
          )}
          {selector !== 'raw' && !readOnly && (
            <YamlEditor
              yaml={yaml}
              basicMode={selector === 'basic'}
              error={(reason) => {
                setError(reason)
                if (reason !== '') {
                  setSelector('raw')
                }
              }}
              onChange={(yaml) => {
                setRawYaml(yaml)
                handleYaml(yaml)
              }}
            />
          )}
        </div>
      )}
    </nav>
  )
}

WriteRight.propTypes = {
  handleYaml: PropTypes.func,
  readOnly: PropTypes.bool,
  yaml: PropTypes.string,
}
