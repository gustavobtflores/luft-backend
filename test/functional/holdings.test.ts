import supertest from "supertest";

describe("Holdings data functional tests", () => {
  it("should return holdings prices", async () => {
    const { body, status } = await supertest(app).get("/holdings");
    expect(status).toBe(200);
    expect(body).toBe([{}]);
  });
});
