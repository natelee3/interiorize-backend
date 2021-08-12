const db = require('./conn');

class QuizzesModel {
    constructor(id, user_sub, budget, color_one_id, color_two_id, color_three_id, category_id) {
        this.id = id;
        this.user_sub = user_sub;
        this.budget = budget;
        this.color_one_id = color_one_id;
        this.color_two_id = color_two_id;
        this.color_three_id = color_three_id;
        this.category_id = category_id;
    };

    static async getAllUserQuizData(user_sub) {
        try {
            const response = await db.one(`
                SELECT * FROM quizzes
                WHERE user_sub = '${user_sub}'; `
            )
            return response;
        } catch (error) {
            console.error('ERROR', error)
            return error
        }
    };

    static async addQuizData(reqBody) {
        const { user_sub, budget, color_one_id, color_two_id, color_three_id, category_id } = reqBody;
        try {
            const response = await db.one(`
                INSERT INTO quizzes
                    (user_sub, budget, color_one_id, color_two_id, color_three_id, category_id)
                VALUES
                    ('${user_sub}', ${budget}, ${color_one_id}, ${color_two_id}, ${color_three_id}, ${category_id}); `
            )
            return response;
        } catch (error) {
            console.error('ERROR', error)
            return error
        }
    };

    static async updateQuizData(reqBody) {
        const { user_sub, budget, color_one_id, color_two_id, color_three_id, category_id } = reqBody;
        try {
            const response = await db.one(`
                UPDATE quizzes
                SET budget = ${budget},
                    color_one_id = ${color_one_id},
                    color_two_id = ${color_two_id},
                    color_three_id = ${color_three_id},
                    category_id = ${category_id}
                WHERE user_sub = '${user_sub}'; `
            )
            return response;
        } catch (error) {
            console.error('ERROR', error)
            return error
        }
    };
};

module.exports = QuizzesModel;