const { User, Query: UserQuery, Mutation: UserMutation } = require('./userResolver');
const { Article, Query: ArticleQuery, Mutation: ArticleMutation } = require('./articleResolver')
const { Tag, Query: TagQuery, Mutation: TagMutation } = require('./tagResolver')
const { Version, Query: VersionQuery, Mutation: VersionMutation } = require('./versionResolver')
const { Workspace, Query: WorkspaceQuery, Mutation: WorkspaceMutation } = require('./workspaceResolver')
const { Mutation: AuthMutation } = require('./authResolver')
const { InstanceUsageStats, Query: StatsQuery } = require('./statsResolver')
const { EmailAddressResolver, JWTResolver, HexColorCodeResolver, DateTimeResolver } = require('graphql-scalars')

module.exports = {
  // Custom Scalars
  EmailAddress: EmailAddressResolver,
  JWT: JWTResolver,
  HexColorCode: HexColorCodeResolver,
  DateTime: DateTimeResolver,

  // Types and Nested queries/mutations
  User,
  Article,
  Tag,
  Version,
  InstanceUsageStats,
  Workspace,
  // Root queries & mutations
  Query: {
    ...UserQuery,
    ...ArticleQuery,
    ...TagQuery,
    ...VersionQuery,
    ...StatsQuery,
    ...WorkspaceQuery,
  },
  Mutation: {
    ...UserMutation,
    ...ArticleMutation,
    ...TagMutation,
    ...VersionMutation,
    ...AuthMutation,
    ...WorkspaceMutation,
  }
}
