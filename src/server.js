import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'
import { handleLegacyOptions } from 'apollo-engine-reporting/dist/agent';

const types = ['product', 'coupon', 'user']

export const start = async () => {

  //TODO=== Create GraphQL schemas by Schema Definition Language (SDL)
  //?== 1-Scalar Types => String, Int, Float, Boolean, ID
  //?== 2-Object Types => Custom shapes with fields | describe any arguments and/or validations
  //?== 3-Query Types => type Query {READ:...}
  //?== 4-Mutation Types => the intent of mutation the DB (CRUD)
  const rootSchema = `
  type Cat {
    name: String
    age: Int!
    bestFriend: Cat
  }

  input CatInput {
    name: String
    age: Int!
    bestFriend: Cat
  }

  type Query {
    myCat: Cat
    hello: String
  }

  type Mutation {
    newCat(input: CatInput!): Cat!
  }

    schema {
      query: Query
    }
  `

  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    typeDefs: [rootSchema],
    resolvers: {
      Query: {
        myCat(){
          return {
            name: 'Garfield',
            bestFriend: {
              name: 'Cony'
            }
            
          }
        },
        hello(){
          return "Hi i'm GraphQL"
        }
      }
    },
    context({ req }) {
      // use the authenticate function from utils to auth req, its Async!
      return { user: null }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
