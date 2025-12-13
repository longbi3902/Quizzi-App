"use strict";
/**
 * Script để fix các mã đề có question_order rỗng
 * Chạy: npx ts-node scripts/fix-exam-codes.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
async function fixExamCodes() {
    try {
        console.log('🔍 Đang tìm các mã đề có question_order rỗng...');
        // Lấy tất cả mã đề có question_order rỗng hoặc null
        const examCodes = await (0, database_1.query)(`SELECT id, exam_id, code, question_order 
       FROM exam_codes 
       WHERE question_order IS NULL 
          OR question_order = '[]' 
          OR question_order = '' 
          OR JSON_LENGTH(question_order) = 0`);
        console.log(`📋 Tìm thấy ${examCodes.length} mã đề cần fix`);
        for (const examCode of examCodes) {
            console.log(`\n🔧 Đang fix mã đề: ${examCode.code} (ID: ${examCode.id}, Exam ID: ${examCode.exam_id})`);
            // Lấy danh sách question IDs từ đề thi (theo thứ tự order_index)
            const examQuestions = await (0, database_1.query)(`SELECT question_id 
         FROM exam_questions 
         WHERE exam_id = ? 
         ORDER BY order_index`, [examCode.exam_id]);
            const questionIds = examQuestions.map((eq) => eq.question_id);
            if (questionIds.length === 0) {
                console.log(`⚠️  Đề thi ${examCode.exam_id} không có câu hỏi, bỏ qua`);
                continue;
            }
            // Đảo thứ tự câu hỏi (shuffle)
            const shuffledOrder = [...questionIds];
            for (let j = shuffledOrder.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffledOrder[j], shuffledOrder[k]] = [shuffledOrder[k], shuffledOrder[j]];
            }
            const questionOrderJson = JSON.stringify(shuffledOrder);
            console.log(`   Question IDs: ${questionIds.join(', ')}`);
            console.log(`   Shuffled order: ${shuffledOrder.join(', ')}`);
            // Cập nhật vào database
            await (0, database_1.query)('UPDATE exam_codes SET question_order = ? WHERE id = ?', [questionOrderJson, examCode.id]);
            console.log(`✅ Đã fix mã đề ${examCode.code}`);
        }
        console.log('\n✨ Hoàn thành!');
    }
    catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}
fixExamCodes();
