import React, { useState, useCallback } from 'react'
import { Check } from 'react-feather'

import etv from '../helpers/eventTargetValue'
import { useGraphQL } from '../helpers/graphQL'
import { createArticle as query } from './Articles.graphql'

import styles from './createArticle.module.scss'
import Button from './Button'
import Field from './Field'
import ArticleTag from './Tag'

export default function CreateArticle ({ currentUserId, tags, cancel, triggerReload }) {
  const [title, setTitle] = useState('')
  const [selectedTagIds, setSelectedtagIds] = useState([])
  const runQuery = useGraphQL()


  const handleSubmit = useCallback(async (event) => {
    const variables = { user: currentUserId, title, tags: selectedTagIds }

    event.preventDefault()
    await runQuery({ query, variables })
    triggerReload()
  }, [title, selectedTagIds])

  const handleTitleChange = useCallback(event => setTitle(etv(event)), [])
  const toggleCheckedTags = useCallback(event => {
    const _id = etv(event)
    selectedTagIds.includes(_id)
      ? setSelectedtagIds(selectedTagIds.filter(tagId => tagId !== _id))
      : setSelectedtagIds([...selectedTagIds, _id])
  }, [selectedTagIds])

  return (
    <section className={styles.create}>
      <form onSubmit={handleSubmit}>
        <Field
          type="text"
          placeholder="Article title"
          value={title}
          autoFocus={true}
          className={styles.articleTitle}
          onChange={handleTitleChange}
        />

        <fieldset className={styles.fieldset}>
          <legend>Select tags</legend>
          <ul className={styles.tags}>
            {tags.map((t) => (
              <li key={`selectTag-${t._id}`}>
                <ArticleTag
                  tag={t}
                  checked={selectedTagIds.includes(t._id)}
                  name={`selectTag-${t._id}`}
                  onClick={toggleCheckedTags}
                  disableAction={false}
                />
              </li>
            ))}
          </ul>
        </fieldset>
        <ul className={styles.actions}>
          <li>
            <Button type="button" onClick={cancel}>Cancel</Button>
          </li>
          <li>
            <Button primary={true} type="submit" title="Create Article">
              <Check />
              Create this article
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
