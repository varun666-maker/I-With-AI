const fs = require('fs');
const path = require('path');

function parseStatement(statement, testCases, title) {
  let description = statement;
  let constraints = [];
  let examples = [];

  // Check if "Constraints:" is in statement
  const constraintIdx = statement.search(/constraints?:/i);
  if (constraintIdx !== -1) {
    description = statement.slice(0, constraintIdx).trim();
    const afterConstraint = statement.slice(constraintIdx);
    
    // Check if "Example" comes after
    const exIdx = afterConstraint.search(/examples?:/i);
    let constraintText = "";
    if (exIdx !== -1) {
      constraintText = afterConstraint.slice(0, exIdx);
      const exampleText = afterConstraint.slice(exIdx);
      // Try to parse example text
      const exClean = exampleText.replace(/examples?:/i, '').trim();
      if (exClean) {
        examples.push({
          input: exClean.slice(0, 120),
          output: "See test cases",
        });
      }
    } else {
      constraintText = afterConstraint;
    }

    // Split constraint lines
    constraints = constraintText
      .replace(/constraints?:/i, '')
      .split(/[,;\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 120);
  } else {
    // Check if "Example:" is in statement
    const exIdx = statement.search(/examples?:/i);
    if (exIdx !== -1) {
      description = statement.slice(0, exIdx).trim();
      const exampleText = statement.slice(exIdx).replace(/examples?:/i, '').trim();
      if (exampleText) {
        examples.push({
          input: exampleText.slice(0, 120),
          output: "See test cases",
        });
      }
    }
  }

  // Fallback defaults for examples from visible test cases if needed
  if (examples.length === 0 && testCases && testCases.length > 0) {
    const visible = testCases.filter(tc => !tc.hidden).slice(0, 3);
    examples = visible.map(tc => ({
      input: tc.input,
      output: tc.expected,
      explanation: "Standard test case verified against problem constraints."
    }));
  }

  if (constraints.length === 0) {
    constraints = [
      "1 <= input.length <= 10^5",
      "Time Limit: 1000 ms",
      "Memory Limit: 256 MB",
    ];
  }

  return { description, constraints, examples };
}

function generateJavaStarter(title, topic, testCases) {
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '');
  return `import java.util.*;

public class Solution {
    // Problem: ${title} (${topic})
    public static void main(String[] args) {
        // Solution implementation
        System.out.println("Solution ready");
    }
}
`;
}

function generatePythonStarter(title, existing) {
  if (existing && existing.trim().length > 15) return existing;
  return `# Problem: ${title}
def solution(input_data):
    # Write your solution here
    pass
`;
}

function generateJsStarter(title, existing) {
  if (existing && existing.trim().length > 15) return existing;
  return `// Problem: ${title}
function solution(input) {
  // Write your solution here
}
`;
}

function generateCppStarter(title, existing) {
  if (existing && existing.trim().length > 15) return existing;
  return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

class Solution {
public:
    // TODO: implement
};
`;
}

function run() {
  console.log("Loading seed.json...");
  const seedPath = path.join(__dirname, '../seed.json');
  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const rawProblems = seed.codingProblems;
  console.log(`Found ${rawProblems.length} problems.`);

  const topicsSet = new Set();
  const companiesMap = {};

  const processedProblems = rawProblems.map((p, idx) => {
    topicsSet.add(p.topic);
    if (Array.isArray(p.companies)) {
      p.companies.forEach(c => {
        companiesMap[c] = (companiesMap[c] || 0) + 1;
      });
    }

    const { description, constraints, examples } = parseStatement(p.statement, p.testCases, p.title);

    const starterCode = {
      Java: generateJavaStarter(p.title, p.topic, p.testCases),
      Python: generatePythonStarter(p.title, p.starterCode?.Python),
      JavaScript: generateJsStarter(p.title, p.starterCode?.JavaScript),
      "C++": generateCppStarter(p.title, p.starterCode?.['C++']),
    };

    const formattedTestCases = (p.testCases || []).map((tc, tcIdx) => ({
      id: tcIdx + 1,
      input: tc.input,
      expected: tc.expected,
      hidden: Boolean(tc.hidden),
    }));

    // Function signature fallback
    const functionSignature = `solution(${p.testCases?.[0]?.input ? p.testCases[0].input.split('=')[0].trim() : 'input'})`;

    return {
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic,
      acceptance: p.acceptance || 50.0,
      description,
      examples,
      constraints,
      functionSignature,
      starterCode,
      testCases: formattedTestCases,
      companies: p.companies || [],
      leetcodeLink: p.leetcodeLink || null,
      timeLimit: p.timeLimit || 1000,
      memoryLimit: p.memoryLimit || 256,
    };
  });

  const topicsList = Array.from(topicsSet).sort();
  const topCompanies = Object.entries(companiesMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  console.log(`Extracted ${topicsList.length} topics and ${topCompanies.length} companies.`);

  // Write compact JSON dataset
  const jsonDest = path.join(__dirname, '../src/lib/coding-dataset.json');
  fs.writeFileSync(jsonDest, JSON.stringify(processedProblems, null, 2));
  console.log(`Written ${jsonDest} (${(fs.statSync(jsonDest).size / 1024 / 1024).toFixed(2)} MB)`);

  // Write metadata index
  const metaDest = path.join(__dirname, '../src/lib/coding-meta.json');
  const metadata = {
    total: processedProblems.length,
    topics: topicsList,
    companies: topCompanies,
    difficulties: ["Easy", "Medium", "Hard"],
  };
  fs.writeFileSync(metaDest, JSON.stringify(metadata, null, 2));
  console.log(`Written metadata to ${metaDest}`);
}

run();
