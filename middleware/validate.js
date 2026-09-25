const { ValidationError } = require("../errors/AppError");

// Validates req.body against a Zod schema and replaces it with the parsed
// (trimmed / lowercased / stripped) data.
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    const details = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!details[key]) details[key] = issue.message;
    }
    return next(new ValidationError(details));
  }

  req.body = result.data;
  next();
};

module.exports = validate;
