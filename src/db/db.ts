import {Pool} from 'pg'
import {drizzle} from 'drizzle-orm/node-postgres'
import * as schema from './schema.ts'
import {env, isProd} from '../../env.ts'
import { remember } from '@epic-web/remember'

const connectPool = ()=>{
    return new Pool({
        connectionString: env.DATABASE_URL
    })
}

let client;

if(isProd) {
    client = connectPool()
} else {
    client = remember('dbPool', () => connectPool())
}

export const db = drizzle({client, schema})

export default db