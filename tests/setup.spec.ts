 
import db from "../src/db/db.ts"
import { users } from "../src/db/schema.ts"
import { createTestUser, wipeDbTables } from "./setup/dbHelpers.ts"
 
describe('it works', ()=>{
    afterEach(async ()=>{
        await wipeDbTables()
    })
    it('connects to db and creates user', async ()=> {
         const {user, token} = await createTestUser()
         expect(user).toBeDefined()
    })
})