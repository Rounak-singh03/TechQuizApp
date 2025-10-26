import Result from "../models/resultModel.js";

// CREATE RESULT - Test-ready without authMiddleware
export async function createResult(req, res) {
  try {
    // console log to debug payload
    console.log("Received payload:", req.body);

    const { title, technology, level, totalQuestions, correct, wrong } = req.body;

    if (!title || !technology || !level || totalQuestions === undefined || correct === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const computedWrong = wrong !== undefined ? Number(wrong) : Math.max(0, Number(totalQuestions) - Number(correct));

    const payload = {
      title: String(title).trim(),
      technology,
      level,
      totalQuestions: Number(totalQuestions),
      correct: Number(correct),
      wrong: computedWrong,
    };

    const created = await Result.create(payload);

    console.log("Result created:", created);

    return res.status(201).json({
      success: true,
      message: 'Result Created',
      result: created,
    });
  } catch (err) {
    console.error('CreateResult Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}

// LIST RESULTS - Test-ready without authMiddleware
export async function listResults(req, res) {
  try {
    const { technology } = req.query;

    const query = {};
    if (technology && technology.toLowerCase() !== 'all') {
      query.technology = technology;
    }

    const items = await Result.find(query).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      results: items,
      message: 'Results fetched successfully',
    });
  } catch (err) {
    console.error('ListResult Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
}
