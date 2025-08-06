// const { exec } = require('child_process');
// require('dotenv').config();

// function getQwenResponse(message) {
//   return new Promise((resolve, reject) => {
//     const pythonCode = `
// from openai import OpenAI
// client = OpenAI(
//   base_url="https://openrouter.ai/api/v1",
//   api_key="${process.env.OPENROUTER_API_KEY}",
// )
// completion = client.chat.completions.create(
//   model="qwen/qwen3-30b-a3b-instruct-2507",
//   messages=[{"role": "user", "content": "${message}"}]
// )
// print(completion.choices[0].message.content)
//     `;

//     const { spawn } = require('child_process');
//     const py = spawn('python', ['-c', pythonCode]); // Use 'python' for Windows

//     let output = '';
//     py.stdout.on('data', (data) => output += data.toString());
//     py.stderr.on('data', (err) => console.error(err.toString()));
//     py.on('close', () => resolve(output.trim()));
//   });
// }

// module.exports = getQwenResponse;

const { spawn } = require('child_process');
require('dotenv').config();

async function getQwenResponse(message) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "qwen/qwen3-30b-a3b-instruct-2507",
        "messages": [
          {
            "role": "user",
            "content": message
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching Qwen response:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

module.exports = getQwenResponse;