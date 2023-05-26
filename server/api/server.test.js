const db = require("../data/db-config");
const server = require("./server");
const superTest = require("supertest");
const bcryptjs = require("bcryptjs")

beforeAll(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
    await db.seed.run();
});

afterAll(async () => {
    await db.destroy();
});

describe('Sanity Test', () => {
    test('Environment üzerinde test yapılıyor', () => {
        expect(process.env.NODE_ENV).toBe('testing');
    })
})

describe("Auth Tests", () => {

    test("[1] Register başarılı mı?", async () => {

        const sample = { "Username": "Ali", "UserEmail": "ali@ali", "Password": "1234" };
        const result = await superTest(server).post("/api/auth/register").send(sample);
        expect(result.status).toBe(201);
        expect(result.body.UserId).toBeGreaterThan(0);
    });

    test("[2] Register olurken email unique kontrolü yapılıyor mu?", async () => {

        const sample = { "Username": "Ayşe", "UserEmail": "ali@ali", "Password": "1234" };
        const result = await superTest(server).post("/api/auth/register").send(sample);
        expect(result.status).toBe(400);
        expect(result.body.message).toBe("Bu e-posta adresi ile kayıtlı bir hesap bulunmaktadır!");
    });

    test("[3] Register olurken username kontrolü yapıyor mu?", async () => {

        const sample = { "UserEmail": "ali@ali", "Password": "1234" };
        const result = await superTest(server).post("/api/auth/register").send(sample);
        expect(result.status).toBe(400);
        expect(result.body.message).toBe("Username ve password gereklidir");

        const sampleSecond = { "Username": "Ali", "UserEmail": "ali@ali", "Password": "1234"  };
        const resultSecond = await superTest(server).post("/api/auth/register").send(sampleSecond);
        expect(resultSecond.status).toBe(400);
        expect(resultSecond.body.message).toEqual("Kullanıcı adı başka bir kullanıcı tarafından alınmış!");
    });

    test("[4] Register olurken password kontrolü yapıyor mu?", async () => {

        const sample = { "Username": "Ali", "UserEmail": "ali@ali" };
        const result = await superTest(server).post("/api/auth/register").send(sample);
        expect(result.status).toBe(400);
        expect(result.body.message).toBe("Username ve password gereklidir");

    });

    test("[5] Register olurken password hashleniyor mu?", async () => {

        const sample = { Username: "Ali", UserEmail: "ali@ali", Password: "1234" };
        await superTest(server).post("/api/auth/register").send(sample);
        const result = await superTest(server).get("/api/user/4");
        expect(bcryptjs.compareSync(sample.Password, result.Password)).toBeTruthy();

    });

    test("[6] Login başarılı mı?", async () => {

        const sample = { "Username": "Bob", "Password": "1234" };
        const result = await superTest(server).post("/api/auth/login").send(sample);
        expect(result.status).toBe(200);
        expect(result.body.message).toEqual("Hoşgeldin Bob");
    });

    test("[7] Login olurken username ve password kontrolü yapıyor mu?", async () => {

        const sampleP = { "Password": "1234" };
        const resultP = await superTest(server).post("/api/auth/login").send(sampleP);
        expect(resultP.status).toBe(400);
        expect(resultP.body.message).toEqual("Username ve password gereklidir");

        const sampleU = { "Username": "Bob" };
        const resultU = await superTest(server).post("/api/auth/login").send(sampleU);
        expect(resultU.status).toBe(400);
        expect(resultU.body.message).toEqual("Username ve password gereklidir");
    });

    test("[8] Login olunca token üretiyor mu?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const result = await superTest(server).post("/api/auth/login").send(sample)
        expect(result.body.token.length).toBeGreaterThan(3);
    });
})

describe("Post Tests", () => {

    test("[9] Token gönderilmeden postlar listeleniyor mu?", async () => {
        const result = await superTest(server).get("/api/post");
        expect(result.status).toBe(400);
        expect(result.body.message).toBe("Token gereklidir!");
    });

    test("[10] Token gönderilince postlar listeleniyor mu?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample)
        expect(loginRes.body.token.length).toBeGreaterThan(3);
        const postsRes = await superTest(server).get("/api/post").set("authorization", loginRes.body.token)
        expect(postsRes.status).toBe(200);
    });

    test("[11] Id'ye göre post listeleniyor mu?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const postsRes = await superTest(server).get("/api/post/3").set("authorization", loginRes.body.token)
        expect(postsRes.status).toBe(200);
        expect(postsRes.body).toMatchObject({
            "PostId": 3,
            "Username": "Egg",
            "FilePath": "https://images.unsplash.com/photo-1477763858572-cda7deaa9bc5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1876&q=80",
            "PostText": "Famous Egg",
            "Comments": [
                {
                    "CommentText": "Eggciting!",
                    "UserId": 1,
                    "Username": "Rumeysa"
                },
                {
                    "CommentText": "Eggciting!",
                    "UserId": 1,
                    "Username": "Rumeysa"
                }
            ],
            "Likes": 0
        });
    });

    test("[12] Post yoksa hata mesajı dönüyor mu?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const postsRes = await superTest(server).get("/api/post/12").set("authorization", loginRes.body.token)
        expect(postsRes.status).toBe(404);
        expect(postsRes.body.message).toEqual("Post not found")
    });

    test("[13] Post ekleniyor mu?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const postSample = { "PostText": "test", "FilePath": "test", "UserId": "2", "Username": "Egg" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const postsRes = await superTest(server).post("/api/post").send(postSample).set("authorization", loginRes.body.token)
        expect(postsRes.status).toBe(201);
        expect(postsRes.body.PostId).toBeGreaterThan(0);
    });

    test("[14] Post siliniyor mu?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const postsRes = await superTest(server).del("/api/post/2").set("authorization", loginRes.body.token)
        expect(postsRes.status).toBe(200);
        expect(postsRes.body.message).toBe("Post silindi");
    });

})

describe("Comments Tests", () => {
    test("[15] Token gönderilmeden comment ekleniyor mu?", async () => {
        const sample = { "CommentText": "test comment", "PostId": "3", "UserId": "3" }
        const result = await superTest(server).post("/api/comment").send(sample);
        expect(result.status).toBe(400);
        expect(result.body.message).toBe("Token gereklidir!");
    });

    test("[16] Token gönderildiğinde comment ekleniyor mu?", async () => {
        const sampleLogin = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sampleLogin);
        const commentSample = { "CommentText": "test comment", "PostId": "3", "UserId": "3" }
        const commentRes = await superTest(server).post("/api/comment").send(commentSample).set("authorization", loginRes.body.token)
        expect(commentRes.status).toBe(201);
        expect(commentRes.body.CommentId).toBeGreaterThan(0);
    });

    test("[17] Comment siliniyor mu?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const commentsRes = await superTest(server).del("/api/comment/2").set("authorization", loginRes.body.token)
        expect(commentsRes.status).toBe(200);
        expect(commentsRes.body.message).toBe("Comment silindi");
    });
})

describe("Users Tests", () => {

    test("[18] Users listeleniyor mu ?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const userList = await superTest(server).get("/api/user").set("authorization", loginRes.body.token);
        expect(userList.body.length).toBeGreaterThan(0);
    });

    test("[19] User Id'ye göre listeleniyor mu ?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const userList = await superTest(server).get("/api/user/2").set("authorization", loginRes.body.token);
        expect(userList.body.UserEmail).toEqual("egg@gmail.com")
    });

    test("[20] User güncelleniyor mu ?", async () => {
        const sample = { "Username": "Bob", "Password": "1234" }
        const loginRes = await superTest(server).post("/api/auth/login").send(sample);
        const changes = { "Username": "AliAli", "UserEmail": "bob@gmail.com", "Password": "1234" }
        const updateUser = await superTest(server).put("/api/user/3").set("authorization", loginRes.body.token).send(changes);
        expect(updateUser.body.Username).toEqual("AliAli");
    });
})
