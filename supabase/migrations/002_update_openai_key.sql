-- Update OpenAI API key with the correct one
UPDATE secrets 
SET 
  key_value = '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',
  updated_at = NOW()
WHERE key_name = 'OPENAI_API_KEY';

