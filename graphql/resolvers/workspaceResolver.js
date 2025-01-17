const { ApiError } = require('../helpers/errors')
const Workspace = require('../models/workspace')


async function workspace (_, { workspaceId }, { user }) {
  if (user?.admin === true) {
    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
      throw new ApiError('NOT_FOUND', `Unable to find workspace with id ${workspaceId}`)
    }
    return workspace
  }
  const workspace = await Workspace.findOne({
    $and: [
      { _id: workspaceId },
      { 'members.user': user?._id }
    ]
  })
  if (!workspace) {
    throw new ApiError('NOT_FOUND', `Unable to find workspace with id ${workspaceId} for user with id ${user?._id}`)
  }
  return workspace
}

class WorkspaceArticle {

  constructor (workspace, article) {
    this.workspace = workspace
    this.article = article
  }

  remove () {
    if (this.article) {
      this.workspace.articles.pull({ _id: this.article._id })
      return this.workspace.save()
    }
    return this.workspace
  }
}

class WorkspaceMember {

  constructor (workspace, member) {
    this.workspace = workspace
    this.member = member
  }

  remove () {
    if (this.member) {
      this.workspace.members.pull({ _id: this.member._id })
      return this.workspace.save()
    }
    return this.workspace
  }
}

module.exports = {
  Mutation: {
    async createWorkspace (_, args, { user }) {
      const { createWorkspaceInput } = args
      if (!user) {
        throw new ApiError('UNAUTHENTICATED', 'Unable to create a workspace as an unauthenticated user')
      }
      // any user can create a workspace
      const newWorkspace = new Workspace({
        name: createWorkspaceInput.name,
        color: createWorkspaceInput.color,
        members: [{ user: user._id }],
        articles: [],
        creator: user._id,
      })
      return newWorkspace.save()
    },

    /**
     *
     */
    workspace
  },

  Query: {
    /**
     *
     */
    workspace,

    /**
     *
     */
    async workspaces (_, { user }) {
      if (user?.admin === true) {
        return Workspace.find()
      }
      return Workspace.find({ 'members.user': user?._id }).lean()
    },
  },

  Workspace: {
    async article (workspace, { articleId }) {
      const article = workspace.articles.find((id) => String(id) === articleId)
      return new WorkspaceArticle(workspace, article)
    },

    async articles (workspace, { limit }) {
      await workspace.populate({ path: 'articles', limit }).execPopulate()
      return workspace.articles
    },

    async member (workspace, { userId }) {
      const member = workspace.members.find(m => String(m.user) === userId)
      return new WorkspaceMember(workspace, member)
    },

    async members (workspace, { limit }) {
      await workspace.populate({ path: 'members', populate: 'user', limit }).execPopulate()
      return workspace.members
    },

    // mutations

    async leave (workspace, args, { user }) {
      if (!user) {
        throw new ApiError('UNAUTHENTICATED', 'Unable to leave a workspace as an unauthenticated user')
      }
      workspace.members.pull({ user: user.id })
      return workspace.save()
    },

    async addArticle (workspace, { articleId }) {
      const articleAlreadyAdded = workspace.articles.find((id) => String(id) === articleId)
      if (articleAlreadyAdded) {
        return workspace
      }
      workspace.articles.push({ _id: articleId })
      return workspace.save()
    },

    async inviteMember (workspace, { userId, role }) {
      // question: should we check that the authenticated user "knows" the member?
      const memberAlreadyInvited = workspace.members.find((id) => String(id) === userId)
      if (memberAlreadyInvited) {
        return workspace
      }
      workspace.members.push({ user: userId, role })
      return workspace.save()
    },
  }
}
