const { ApiError } = require('../helpers/errors')
const Group = require('../models/group')


async function group (_, { groupId }, { user }) {
  if (user?.admin === true) {
    const group = await Group.findById(groupId)
    if (!group) {
      throw new ApiError('NOT_FOUND', `Unable to find group with id ${groupId}`)
    }
    return group
  }
  const group = await Group.findOne({
    $and: [
      { _id: groupId },
      { members: user?._id }
    ]
  })
  if (!group) {
    throw new ApiError('NOT_FOUND', `Unable to find group with id ${groupId} for user with id ${user?._id}`)
  }
  return group
}

class ArticleWithinGroup {

  constructor (group, article) {
    this.group = group
    this.article = article
  }

  remove () {
    if (this.article) {
      this.group.articles.pull({ _id: this.article._id })
      return this.group.save()
    }
    return this.group
  }
}

class MemberWithinGroup {

  constructor (group, member) {
    this.group = group
    this.member = member
  }

  remove () {
    if (this.member) {
      this.group.members.pull({ _id: this.member._id })
      return this.group.save()
    }
    return this.group
  }
}

module.exports = {
  Mutation: {
    async createGroup (_, args, { user }) {
      const { createGroupInput } = args
      if (!user) {
        throw new ApiError('UNAUTHENTICATED', 'Unable to create a group as an unauthenticated user')
      }
      // any user can create a group
      const newGroup = new Group({
        name: createGroupInput.name,
        color: createGroupInput.color,
        members: [user._id],
        articles: [],
        creator: user._id,
      })
      return newGroup.save()
    },

    /**
     *
     */
    group
  },

  Query: {
    /**
     *
     */
    group,

    /**
     *
     */
    async groups (_, args, { user }) {
      if (user?.admin === true) {
        return Group.find()
      }
      return Group.find({ members: user?._id })
    },
  },

  Group: {
    async article(group, { articleId }) {
      const article = group.articles.find((id) => String(id) === articleId)
      return new ArticleWithinGroup(group, article)
    },

    async articles (group, { limit }) {
      await group.populate({ path: 'articles', limit }).execPopulate()
      return group.articles
    },

    async member (group, { userId }) {
      const member = group.members.find((id) => String(id) === userId)
      return new ArticleWithinGroup(group, member)
    },

    async members (group, { limit }) {
      await group.populate({ path: 'members', limit }).execPopulate()
      return group.members
    },

    // mutations

    async leave (group, args, { user }) {
      if (!user) {
        throw new ApiError('UNAUTHENTICATED', 'Unable to leave a group as an unauthenticated user')
      }
      group.members.pull({ _id: user.id })
      return group.save()
    },

    async addArticle (group, { articleId }) {
      const articleAlreadyAdded = group.articles.find((id) => String(id) === articleId)
      if (articleAlreadyAdded) {
        return group
      }
      group.articles.push({ _id: articleId })
      return group.save()
    },

    async inviteMember (group, { userId }) {
      // question: should we check that the authenticated user "knows" the member?
      const memberAlreadyInvited = group.members.find((id) => String(id) === userId)
      if (memberAlreadyInvited) {
        return group
      }
      group.members.push({ _id: userId })
      return group.save()
    },
  }
}
