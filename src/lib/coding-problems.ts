/**
 * Mock question bank for the Coding Arena. Pure data module, no React,
 * so it can be imported from server components, API routes, or client
 * components without triggering any bundler restrictions.
 *
 * 24 problems are spread across 6 topics:
 *   - Arrays (5)   - Strings (4)   - DP (5)
 *   - Graphs (3)    - SQL (3)       - Misc (4)
 *
 * Every problem ships with 10 test cases (3 visible + 7 hidden) plus
 * Python and JavaScript starter code.
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Topic = "Arrays" | "Strings" | "DP" | "Graphs" | "SQL" | "Misc";

export const TOPICS: Topic[] = ["Arrays", "Strings", "DP", "Graphs", "SQL", "Misc"];
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export interface CodingExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: number;
  input: string;
  expected: string;
  hidden: boolean;
}

export interface CodingProblem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  description: string;
  examples: CodingExample[];
  constraints: string[];
  testCases: TestCase[];
  functionSignature: string;
  starterCode: Record<string, string>;
  acceptance: number;
}

const PY_STARTER = "def solution(input):\n    pass\n";
const JS_STARTER = "function solution(input) {\n  // Write your solution here\n}\n";

function py(fnName: string): string {
  return `def ${fnName}(input):\n    pass\n`;
}

function js(fnName: string): string {
  return `function ${fnName}(input) {\n  // Write your solution here\n}\n`;
}

function starter(fnName: string): Record<string, string> {
  return { Python: py(fnName), JavaScript: js(fnName) };
}

/**
 * Convenience factory: builds the 10-case test array with the first 3
 * marked visible and the remaining 7 marked hidden.
 */
function cases(rows: Array<[string, string]>): TestCase[] {
  return rows.map(([input, expected], i) => ({
    id: i + 1,
    input,
    expected,
    hidden: i >= 3,
  }));
}

export const CODING_PROBLEMS: CodingProblem[] = [
  // ----------------------------------------------------------------- Arrays
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. The answer can be returned in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    testCases: cases([
      ["nums = [2,7,11,15], target = 9", "[0,1]"],
      ["nums = [3,2,4], target = 6", "[1,2]"],
      ["nums = [3,3], target = 6", "[0,1]"],
      ["nums = [1,5,8,12,7], target = 13", "[2,3]"],
      ["nums = [10,20,30,40], target = 50", "[1,2]"],
      ["nums = [0,-1,2,-3,1], target = -2", "[1,3]"],
      ["nums = [5,5,5,5], target = 10", "[0,1]"],
      ["nums = [99,1,2,99], target = 100", "[0,3]"],
      ["nums = [-3,4,3,90], target = 0", "[0,2]"],
      ["nums = [1,8,2,7,3,6,4,5], target = 9", "[0,1]"],
    ]),
    functionSignature: "twoSum(nums, target)",
    starterCode: starter("twoSum"),
    acceptance: 52,
  },
  {
    id: 2,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topic: "Arrays",
    description:
      "You are given an array prices where prices[i] is the price of a given stock on day i. You want to maximize your profit by choosing a single day to buy one stock and a different day in the future to sell that stock. Return the maximum profit you can achieve. If no profit is possible, return 0.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price 1), sell on day 5 (price 6)." },
      { input: "prices = [7,6,4,3,1]", output: "0" },
      { input: "prices = [1,2,3,4,5]", output: "4" },
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
    ],
    testCases: cases([
      ["prices = [7,1,5,3,6,4]", "5"],
      ["prices = [7,6,4,3,1]", "0"],
      ["prices = [1,2,3,4,5]", "4"],
      ["prices = [2,4,1]", "2"],
      ["prices = [3,3,3,3]", "0"],
      ["prices = [1,2,4,2,5,7,2,4,9,0]", "8"],
      ["prices = [9,8,7,6,5,4,3,2,1]", "0"],
      ["prices = [1]", "0"],
      ["prices = [2,1,2,1,0,1,2]", "2"],
      ["prices = [5,10,2,8,1,5]", "5"],
    ]),
    functionSignature: "maxProfit(prices)",
    starterCode: starter("maxProfit"),
    acceptance: 54,
  },
  {
    id: 3,
    title: "Contains Duplicate",
    difficulty: "Easy",
    topic: "Arrays",
    description:
      "Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" },
      { input: "nums = [1,2,3,4]", output: "false" },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" },
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
    ],
    testCases: cases([
      ["nums = [1,2,3,1]", "true"],
      ["nums = [1,2,3,4]", "false"],
      ["nums = [1,1,1,3,3,4,3,2,4,2]", "true"],
      ["nums = [0]", "false"],
      ["nums = [1,2,3,4,5,6,7,8,9,1]", "true"],
      ["nums = [-1,-2,-3,-1]", "true"],
      ["nums = [1,2,3,4,5,6,7,8,9,0]", "false"],
      ["nums = [9,9,9,9,9,9]", "true"],
      ["nums = [1,2]", "false"],
      ["nums = [2,2]", "true"],
    ]),
    functionSignature: "containsDuplicate(nums)",
    starterCode: starter("containsDuplicate"),
    acceptance: 63,
  },
  {
    id: 4,
    title: "Product of Array Except Self",
    difficulty: "Medium",
    topic: "Arrays",
    description:
      "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.",
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
      { input: "nums = [4,3,2,1]", output: "[6,8,12,24]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^5",
      "-30 <= nums[i] <= 30",
      "The product of any prefix or suffix fits in a 32-bit integer.",
    ],
    testCases: cases([
      ["nums = [1,2,3,4]", "[24,12,8,6]"],
      ["nums = [-1,1,0,-3,3]", "[0,0,9,0,0]"],
      ["nums = [4,3,2,1]", "[6,8,12,24]"],
      ["nums = [1,1,1,1]", "[1,1,1,1]"],
      ["nums = [0,0]", "[0,0]"],
      ["nums = [5]", "[1]"],
      ["nums = [2,3,0,0]", "[0,0,0,0]"],
      ["nums = [-1,-2,-3,-4]", "[-24,-12,-8,-6]"],
      ["nums = [1,2,3,4,5]", "[120,60,40,30,24]"],
      ["nums = [10,3,5,6,2]", "[180,600,360,300,900]"],
    ]),
    functionSignature: "productExceptSelf(nums)",
    starterCode: starter("productExceptSelf"),
    acceptance: 65,
  },
  {
    id: 5,
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Arrays",
    description:
      "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
    ],
    testCases: cases([
      ["nums = [-2,1,-3,4,-1,2,1,-5,4]", "6"],
      ["nums = [1]", "1"],
      ["nums = [5,4,-1,7,8]", "23"],
      ["nums = [-1,-2,-3,-4]", "-1"],
      ["nums = [0,0,0,0]", "0"],
      ["nums = [1,2,3,4,5]", "15"],
      ["nums = [-2,1]", "1"],
      ["nums = [1,-1,1,-1,1,1]", "2"],
      ["nums = [10,-1,2,-1,3,-1,4]", "16"],
      ["nums = [-5]", "-5"],
    ]),
    functionSignature: "maxSubArray(nums)",
    starterCode: starter("maxSubArray"),
    acceptance: 51,
  },

  // ----------------------------------------------------------------- Strings
  {
    id: 6,
    title: "Valid Palindrome",
    difficulty: "Easy",
    topic: "Strings",
    description:
      "Given a string s, return true if it is a palindrome after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters. Alphanumeric characters include letters and numbers.",
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true" },
      { input: 's = "race a car"', output: "false" },
      { input: 's = " "', output: "true" },
    ],
    constraints: [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters.",
    ],
    testCases: cases([
      ['s = "A man, a plan, a canal: Panama"', "true"],
      ['s = "race a car"', "false"],
      ['s = " "', "true"],
      ['s = "ab_a"', "true"],
      ['s = "0P"', "false"],
      ['s = "12321"', "true"],
      ['s = "Noon"', "true"],
      ['s = "Was it a car or a cat I saw?"', "true"],
      ['s = ".,"', "true"],
      ['s = "ab"', "false"],
    ]),
    functionSignature: "isPalindrome(s)",
    starterCode: starter("isPalindrome"),
    acceptance: 50,
  },
  {
    id: 7,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Strings",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: "1" },
      { input: 's = "pwwkew"', output: "3" },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    testCases: cases([
      ['s = "abcabcbb"', "3"],
      ['s = "bbbbb"', "1"],
      ['s = "pwwkew"', "3"],
      ['s = ""', "0"],
      ['s = " "', "1"],
      ['s = "au"', "2"],
      ['s = "dvdf"', "3"],
      ['s = "anviaj"', "5"],
      ['s = "abcdefg"', "7"],
      ['s = "abba"', "2"],
    ]),
    functionSignature: "lengthOfLongestSubstring(s)",
    starterCode: starter("lengthOfLongestSubstring"),
    acceptance: 36,
  },
  {
    id: 8,
    title: "Valid Anagram",
    difficulty: "Easy",
    topic: "Strings",
    description:
      "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false" },
      { input: 's = "", t = ""', output: "true" },
    ],
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters.",
    ],
    testCases: cases([
      ['s = "anagram", t = "nagaram"', "true"],
      ['s = "rat", t = "car"', "false"],
      ['s = "", t = ""', "true"],
      ['s = "a", t = "a"', "true"],
      ['s = "a", t = "b"', "false"],
      ['s = "listen", t = "silent"', "true"],
      ['s = "hello", t = "world"', "false"],
      ['s = "aab", t = "aba"', "true"],
      ['s = "aab", t = "abb"', "false"],
      ['s = "anagram", t = "nagaramm"', "false"],
    ]),
    functionSignature: "isAnagram(s, t)",
    starterCode: starter("isAnagram"),
    acceptance: 66,
  },
  {
    id: 9,
    title: "Group Anagrams",
    difficulty: "Medium",
    topic: "Strings",
    description:
      "Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters.",
    ],
    testCases: cases([
      ['strs = ["eat","tea","tan","ate","nat","bat"]', '[["bat"],["nat","tan"],["ate","eat","tea"]]'],
      ['strs = [""]', '[[""]]'],
      ['strs = ["a"]', '[["a"]]'],
      ['strs = ["cab","tin","pew","duh","may","ill","buy","bar","max","doc"]', "10 groups"],
      ['strs = ["a","b","c","a","b","c"]', '[["a","a"],["b","b"],["c","c"]]'],
      ['strs = ["aaa","aaa","aaa"]', '[["aaa","aaa","aaa"]]'],
      ['strs = ["abc","cba","bac","cab","bca","acb"]', '[["abc","cba","bac","cab","bca","acb"]]'],
      ['strs = ["x","y","z"]', '[["x"],["y"],["z"]]'],
      ['strs = ["aa","aa"]', '[["aa","aa"]]'],
      ['strs = ["abc","def"]', '[["abc"],["def"]]'],
    ]),
    functionSignature: "groupAnagrams(strs)",
    starterCode: starter("groupAnagrams"),
    acceptance: 67,
  },

  // ----------------------------------------------------------------- DP
  {
    id: 10,
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "DP",
    description:
      "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1 or 2." },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1." },
      { input: "n = 4", output: "5" },
    ],
    constraints: ["1 <= n <= 45"],
    testCases: cases([
      ["n = 1", "1"],
      ["n = 2", "2"],
      ["n = 3", "3"],
      ["n = 4", "5"],
      ["n = 5", "8"],
      ["n = 6", "13"],
      ["n = 7", "21"],
      ["n = 8", "34"],
      ["n = 10", "89"],
      ["n = 45", "1836311903"],
    ]),
    functionSignature: "climbStairs(n)",
    starterCode: starter("climbStairs"),
    acceptance: 53,
  },
  {
    id: 11,
    title: "House Robber",
    difficulty: "Medium",
    topic: "DP",
    description:
      "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob house 1 (1) then house 3 (3)." },
      { input: "nums = [2,7,9,3,1]", output: "12" },
      { input: "nums = [2,1,1,2]", output: "4" },
    ],
    constraints: [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400",
    ],
    testCases: cases([
      ["nums = [1,2,3,1]", "4"],
      ["nums = [2,7,9,3,1]", "12"],
      ["nums = [2,1,1,2]", "4"],
      ["nums = [0]", "0"],
      ["nums = [5]", "5"],
      ["nums = [1,2,3,4,5,6,7]", "16"],
      ["nums = [10,1,1,10]", "20"],
      ["nums = [100,1,1,100,1,1,100]", "300"],
      ["nums = [2,4,8,9,9,3]", "19"],
      ["nums = [6,6,4,8,4,3,3,10]", "27"],
    ]),
    functionSignature: "rob(nums)",
    starterCode: starter("rob"),
    acceptance: 52,
  },
  {
    id: 12,
    title: "Coin Change",
    difficulty: "Medium",
    topic: "DP",
    description:
      "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1. You may assume that you have an infinite number of each kind of coin.",
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1." },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
    ],
    testCases: cases([
      ["coins = [1,2,5], amount = 11", "3"],
      ["coins = [2], amount = 3", "-1"],
      ["coins = [1], amount = 0", "0"],
      ["coins = [1], amount = 1", "1"],
      ["coins = [1], amount = 2", "2"],
      ["coins = [1,5,10,25], amount = 63", "6"],
      ["coins = [186,419,83,408], amount = 6249", "20"],
      ["coins = [2,5,10,1], amount = 27", "5"],
      ["coins = [1,3,4], amount = 6", "2"],
      ["coins = [5,10], amount = 7", "-1"],
    ]),
    functionSignature: "coinChange(coins, amount)",
    starterCode: starter("coinChange"),
    acceptance: 43,
  },
  {
    id: 13,
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    topic: "DP",
    description:
      "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    examples: [
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: "Longest increasing subsequence is [2,3,7,101]." },
      { input: "nums = [0,1,0,3,2,3]", output: "4" },
      { input: "nums = [7,7,7,7,7,7,7]", output: "1" },
    ],
    constraints: [
      "1 <= nums.length <= 2500",
      "-10^4 <= nums[i] <= 10^4",
    ],
    testCases: cases([
      ["nums = [10,9,2,5,3,7,101,18]", "4"],
      ["nums = [0,1,0,3,2,3]", "4"],
      ["nums = [7,7,7,7,7,7,7]", "1"],
      ["nums = [1]", "1"],
      ["nums = [1,2,3,4,5]", "5"],
      ["nums = [5,4,3,2,1]", "1"],
      ["nums = [1,3,6,7,9,4,10,5,6]", "6"],
      ["nums = [3,5,6,2,5,4,19,5,6,7,12]", "6"],
      ["nums = [-1,0,1,2,-1,-2]", "4"],
      ["nums = [10,9,2,5,3,4]", "3"],
    ]),
    functionSignature: "lengthOfLIS(nums)",
    starterCode: starter("lengthOfLIS"),
    acceptance: 53,
  },
  {
    id: 14,
    title: "Word Break",
    difficulty: "Medium",
    topic: "DP",
    description:
      "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words. The same word in the dictionary may be reused multiple times in the segmentation.",
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true" },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true" },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 300",
      "1 <= wordDict.length <= 1000",
      "1 <= wordDict[i].length <= 20",
      "s and wordDict[i] consist of only lowercase English letters.",
    ],
    testCases: cases([
      ['s = "leetcode", wordDict = ["leet","code"]', "true"],
      ['s = "applepenapple", wordDict = ["apple","pen"]', "true"],
      ['s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', "false"],
      ['s = "a", wordDict = ["a"]', "true"],
      ['s = "aaaaaaa", wordDict = ["aaaa","aaa"]', "true"],
      ['s = "abcd", wordDict = ["a","abc","b","cd"]', "true"],
      ['s = "ab", wordDict = ["a","b"]', "true"],
      ['s = "ab", wordDict = ["a"]', "false"],
      ['s = "cars", wordDict = ["car","ca","rs"]', "true"],
      ['s = "aaaaaaaaaaaaaaaaaaaaaaaab", wordDict = ["a","aa","aaa"]', "false"],
    ]),
    functionSignature: "wordBreak(s, wordDict)",
    starterCode: starter("wordBreak"),
    acceptance: 47,
  },

  // ----------------------------------------------------------------- Graphs
  {
    id: 15,
    title: "Number of Islands",
    difficulty: "Medium",
    topic: "Graphs",
    description:
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: "1",
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: "3",
      },
      { input: 'grid = [["1"]]', output: "1" },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
    testCases: cases([
      ['grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', "1"],
      ['grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', "3"],
      ['grid = [["1"]]', "1"],
      ['grid = [["0"]]', "0"],
      ['grid = [["1","0"],["0","1"]]', "2"],
      ['grid = [["1","1"],["1","1"]]', "1"],
      ['grid = [["1","0","1"],["0","0","0"],["1","0","1"]]', "4"],
      ['grid = [["1","1","1"],["1","0","1"],["1","1","1"]]', "1"],
      ['grid = [["0","0","0"],["0","0","0"],["0","0","0"]]', "0"],
      ['grid = [["1","1","0","1","1"]]', "2"],
    ]),
    functionSignature: "numIslands(grid)",
    starterCode: starter("numIslands"),
    acceptance: 58,
  },
  {
    id: 16,
    title: "Course Schedule",
    difficulty: "Medium",
    topic: "Graphs",
    description:
      "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai. Return true if you can finish all courses. Otherwise, return false.",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false" },
      { input: "numCourses = 1, prerequisites = []", output: "true" },
    ],
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "All pairs are unique.",
    ],
    testCases: cases([
      ["numCourses = 2, prerequisites = [[1,0]]", "true"],
      ["numCourses = 2, prerequisites = [[1,0],[0,1]]", "false"],
      ["numCourses = 1, prerequisites = []", "true"],
      ["numCourses = 3, prerequisites = [[1,0],[2,1]]", "true"],
      ["numCourses = 3, prerequisites = [[1,0],[0,2],[2,1]]", "false"],
      ["numCourses = 5, prerequisites = [[1,0],[2,0],[3,1],[4,3]]", "true"],
      ["numCourses = 4, prerequisites = [[0,1],[1,2],[2,3],[3,0]]", "false"],
      ["numCourses = 6, prerequisites = [[1,0],[2,1],[3,2],[4,3],[5,4]]", "true"],
      ["numCourses = 2, prerequisites = []", "true"],
      ["numCourses = 4, prerequisites = [[1,0],[2,1],[3,2],[1,3]]", "false"],
    ]),
    functionSignature: "canFinish(numCourses, prerequisites)",
    starterCode: starter("canFinish"),
    acceptance: 49,
  },
  {
    id: 17,
    title: "Clone Graph",
    difficulty: "Medium",
    topic: "Graphs",
    description:
      "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.",
    examples: [
      { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]" },
      { input: "adjList = [[]]", output: "[[]]" },
      { input: "adjList = []", output: "[]" },
    ],
    constraints: [
      "The number of nodes in the graph is in the range [0, 100].",
      "1 <= Node.val <= 100",
      "Node.val is unique for each node.",
    ],
    testCases: cases([
      ["adjList = [[2,4],[1,3],[2,4],[1,3]]", "[[2,4],[1,3],[2,4],[1,3]]"],
      ["adjList = [[]]", "[[]]"],
      ["adjList = []", "[]"],
      ["adjList = [[2],[1]]", "[[2],[1]]"],
      ["adjList = [[2,3,4],[1,3],[1,2,4],[1,3]]", "[[2,3,4],[1,3],[1,2,4],[1,3]]"],
      ["adjList = [[2,3],[1],[1]]", "[[2,3],[1],[1]]"],
      ["adjList = [[2],[1,3],[2]]", "[[2],[1,3],[2]]"],
      ["adjList = [[2,3,4,5],[1,3,4,5],[1,2,4,5],[1,2,3,5],[1,2,3,4]]", "[[2,3,4,5],[1,3,4,5],[1,2,4,5],[1,2,3,5],[1,2,3,4]]"],
      ["adjList = [[2],[1,3],[2,4],[3]]", "[[2],[1,3],[2,4],[3]]"],
      ["adjList = [[2],[3],[4],[5],[1]]", "[[2],[3],[4],[5],[1]]"],
    ]),
    functionSignature: "cloneGraph(node)",
    starterCode: starter("cloneGraph"),
    acceptance: 55,
  },

  // ----------------------------------------------------------------- SQL
  {
    id: 18,
    title: "Second Highest Salary",
    difficulty: "Medium",
    topic: "SQL",
    description:
      "Write a SQL query to get the second highest salary from the Employee table. If there is no second highest salary, the query should return null.",
    examples: [
      { input: "Employee: id=1, salary=100; id=2, salary=200; id=3, salary=300", output: "200" },
      { input: "Employee: id=1, salary=100", output: "null" },
    ],
    constraints: [
      "The Employee table has columns id (PK) and salary.",
      "Salary values can be duplicated.",
    ],
    testCases: cases([
      ["Employee: [(1,100),(2,200),(3,300)]", "200"],
      ["Employee: [(1,100)]", "null"],
      ["Employee: [(1,100),(2,200),(3,300),(4,400),(5,500)]", "400"],
      ["Employee: [(1,100),(2,100),(3,100)]", "null"],
      ["Employee: [(1,500),(2,100),(3,300),(4,200),(5,400)]", "400"],
      ["Employee: [(1,10),(2,20),(3,30),(4,40),(5,50)]", "40"],
      ["Employee: [(1,1),(2,2),(3,3)]", "2"],
      ["Employee: [(1,7),(2,7),(3,7),(4,8)]", "7"],
      ["Employee: [(1,999)]", "null"],
      ["Employee: [(1,5),(2,5),(3,9)]", "5"],
    ]),
    functionSignature: "-- SELECT ... FROM Employee",
    starterCode: {
      Python: PY_STARTER,
      JavaScript: JS_STARTER,
      SQL: "-- Write your query here\nSELECT NULL AS SecondHighestSalary;",
    },
    acceptance: 47,
  },
  {
    id: 19,
    title: "Combine Two Tables",
    difficulty: "Easy",
    topic: "SQL",
    description:
      "Write a SQL query to produce a report that contains firstName, lastName, cityName, and stateName for every person in the Person table, regardless of whether they have an address in the Address table.",
    examples: [
      { input: "Person: [(1,'Allen','Wang')]; Address: [(1,'NY','NYC')]", output: "Allen, Wang, NYC, NY" },
      { input: "Person: [(2,'Bob','Lee')]; Address: []", output: "Bob, Lee, null, null" },
    ],
    constraints: [
      "Person(personId PK, lastName, firstName).",
      "Address(addressId PK, personId FK, city, state).",
    ],
    testCases: cases([
      ["Person=[(1,'Allen','Wang')], Address=[(1,'NY','NYC')]", "Allen, Wang, NYC, NY"],
      ["Person=[(2,'Bob','Lee')], Address=[]", "Bob, Lee, null, null"],
      ["Person=[(1,'A','B'),(2,'C','D')], Address=[(1,'NY','NYC')]", "2 rows"],
      ["Person=[], Address=[]", "0 rows"],
      ["Person=[(1,'A','B')], Address=[(1,'X','Y'),(2,'X','Z')]", "1 row"],
      ["Person=[(1,'X','Y'),(2,'P','Q')], Address=[(2,'CA','LA')]", "2 rows"],
      ["Person=[(1,'John','Doe')], Address=[(1,'TX','Houston')]", "John, Doe, Houston, TX"],
      ["Person=[(1,'A','B'),(2,'C','D'),(3,'E','F')], Address=[]", "3 rows"],
      ["Person=[(5,'Foo','Bar')], Address=[(5,'WA','Seattle')]", "Foo, Bar, Seattle, WA"],
      ["Person=[(1,'A','B'),(2,'C','D'),(3,'E','F')], Address=[(2,'CA','SF'),(3,'NY','NYC')]", "3 rows"],
    ]),
    functionSignature: "-- SELECT ... FROM Person LEFT JOIN Address",
    starterCode: {
      Python: PY_STARTER,
      JavaScript: JS_STARTER,
      SQL: "-- Write your query here\nSELECT firstName, lastName, city, state\nFROM Person\nLEFT JOIN Address ON Person.personId = Address.personId;",
    },
    acceptance: 78,
  },
  {
    id: 20,
    title: "Customers Who Never Order",
    difficulty: "Easy",
    topic: "SQL",
    description:
      "Write a SQL query to report all customers who never order anything. Return the result table ordered by customer name.",
    examples: [
      { input: "Customers=[(1,'Joe'),(2,'Henry'),(3,'Sam'),(4,'Max')]; Orders=[(1,3),(2,1)]", output: "Henry, Max" },
      { input: "Customers=[(1,'Joe')]; Orders=[]", output: "Joe" },
    ],
    constraints: [
      "Customers(id PK, name).",
      "Orders(id PK, customerId FK).",
    ],
    testCases: cases([
      ["Customers=[(1,'Joe'),(2,'Henry'),(3,'Sam'),(4,'Max')], Orders=[(1,3),(2,1)]", "Henry, Max"],
      ["Customers=[(1,'Joe')], Orders=[]", "Joe"],
      ["Customers=[(1,'A'),(2,'B')], Orders=[(1,1),(2,2)]", "(none)"],
      ["Customers=[], Orders=[]", "(none)"],
      ["Customers=[(1,'X'),(2,'Y'),(3,'Z')], Orders=[(1,2)]", "X, Z"],
      ["Customers=[(5,'Foo')], Orders=[(1,5)]", "(none)"],
      ["Customers=[(1,'A'),(2,'B')], Orders=[]", "A, B"],
      ["Customers=[(1,'A'),(2,'B'),(3,'C'),(4,'D')], Orders=[(1,1)]", "B, C, D"],
      ["Customers=[(1,'Joe'),(2,'Sam')], Orders=[(1,1),(2,2)]", "(none)"],
      ["Customers=[(1,'A'),(2,'B'),(3,'C')], Orders=[(1,3)]", "A, B"],
    ]),
    functionSignature: "-- SELECT ... FROM Customers WHERE NOT EXISTS (...)",
    starterCode: {
      Python: PY_STARTER,
      JavaScript: JS_STARTER,
      SQL: "-- Write your query here\nSELECT name AS Customers\nFROM Customers c\nWHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.customerId = c.id);",
    },
    acceptance: 71,
  },

  // ----------------------------------------------------------------- Misc
  {
    id: 21,
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Misc",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1. Open brackets must be closed by the same type of brackets. 2. Open brackets must be closed in the correct order. 3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only.",
    ],
    testCases: cases([
      ['s = "()"', "true"],
      ['s = "()[]{}"', "true"],
      ['s = "(]"', "false"],
      ['s = "([)]"', "false"],
      ['s = "{[]}"', "true"],
      ['s = "]', "false"],
      ['s = "["', "false"],
      ['s = "((()))"', "true"],
      ['s = ""', "true"],
      ['s = "([{}])"', "true"],
    ]),
    functionSignature: "isValid(s)",
    starterCode: starter("isValid"),
    acceptance: 41,
  },
  {
    id: 22,
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Misc",
    description:
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" },
      { input: "intervals = [[1,4],[2,3]]", output: "[[1,4]]" },
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= starti <= endi <= 10^4",
    ],
    testCases: cases([
      ["intervals = [[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]"],
      ["intervals = [[1,4],[4,5]]", "[[1,5]]"],
      ["intervals = [[1,4],[2,3]]", "[[1,4]]"],
      ["intervals = [[1,4],[0,4]]", "[[0,4]]"],
      ["intervals = [[1,4]]", "[[1,4]]"],
      ["intervals = [[1,4],[5,6]]", "[[1,4],[5,6]]"],
      ["intervals = [[2,3],[4,5],[6,7],[8,9],[1,10]]", "[[1,10]]"],
      ["intervals = [[1,10],[2,3],[4,5],[6,7]]", "[[1,10]]"],
      ["intervals = [[1,3],[2,6],[8,10],[15,18]]", "[[1,6],[8,10],[15,18]]"],
      ["intervals = [[5,7],[1,3],[4,6]]", "[[1,7]]"],
    ]),
    functionSignature: "merge(intervals)",
    starterCode: starter("merge"),
    acceptance: 48,
  },
  {
    id: 23,
    title: "LRU Cache",
    difficulty: "Medium",
    topic: "Misc",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class: LRUCache(int capacity) initializes the cache. int get(int key) returns the value of the key if it exists, otherwise -1. void put(int key, int value) updates the value of the key if present, or inserts a new key-value pair. When the cache reaches its capacity, it should evict the least recently used key before inserting a new item.",
    examples: [
      {
        input: "capacity=2; put(1,1); put(2,2); get(1); put(3,3); get(2); put(4,4); get(1); get(3); get(4)",
        output: "1, -1, -1, 3, 4",
      },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put.",
    ],
    testCases: cases([
      ["capacity=2; ops=[put(1,1),put(2,2),get(1),put(3,3),get(2),put(4,4),get(1),get(3),get(4)]", "1,-1,-1,3,4"],
      ["capacity=1; ops=[get(1),put(1,1),get(1)]", "-1,1"],
      ["capacity=2; ops=[put(1,1),put(2,2),get(1),put(3,3),get(2)]", "1,-1"],
      ["capacity=2; ops=[put(2,1),put(1,1),put(2,3),put(4,1),get(1),get(2)]", "-1,3"],
      ["capacity=3; ops=[put(1,1),put(2,2),put(3,3),put(4,4),get(1),get(2),get(3),get(4)]", "-1,2,3,4"],
      ["capacity=2; ops=[get(2),put(2,6),get(1),put(1,5),put(1,2),get(1),get(2)]", "-1,-1,2,6"],
      ["capacity=10; ops=[put(1,1),put(2,2),get(1),get(2)]", "1,2"],
      ["capacity=2; ops=[put(1,1),put(2,2),put(3,3),get(1),get(2),get(3)]", "-1,2,3"],
      ["capacity=1; ops=[put(1,1),get(1),put(2,2),get(1),get(2)]", "1,-1,2"],
      ["capacity=2; ops=[put(1,1),put(2,2),put(3,3),put(4,4),get(1),get(2),get(3),get(4)]", "-1,-1,3,4"],
    ]),
    functionSignature: "class LRUCache",
    starterCode: starter("LRUCache"),
    acceptance: 45,
  },
  {
    id: 24,
    title: "Rotate Image",
    difficulty: "Medium",
    topic: "Misc",
    description:
      "You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. Do not allocate another 2D matrix and do the rotation.",
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" },
      { input: "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]" },
      { input: "matrix = [[1]]", output: "[[1]]" },
    ],
    constraints: [
      "n == matrix.length == matrix[i].length",
      "1 <= n <= 20",
      "-1000 <= matrix[i][j] <= 1000",
    ],
    testCases: cases([
      ["matrix = [[1,2,3],[4,5,6],[7,8,9]]", "[[7,4,1],[8,5,2],[9,6,3]]"],
      ["matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]"],
      ["matrix = [[1]]", "[[1]]"],
      ["matrix = [[1,2],[3,4]]", "[[3,1],[4,2]]"],
      ["matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]", "[[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]"],
      ["matrix = [[1,2,3],[4,5,6],[7,8,9]]", "[[7,4,1],[8,5,2],[9,6,3]]"],
      ["matrix = [[0,1],[2,3]]", "[[2,0],[3,1]]"],
      ["matrix = [[100]]", "[[100]]"],
      ["matrix = [[1,2,3],[4,5,6],[7,8,9]]", "[[7,4,1],[8,5,2],[9,6,3]]"],
      ["matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]", "[[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]"],
    ]),
    functionSignature: "rotate(matrix)",
    starterCode: starter("rotate"),
    acceptance: 70,
  },
];

/**
 * Lookup helper for the coding screen and admin question manager.
 */
export function getProblemById(id: number): CodingProblem | undefined {
  return CODING_PROBLEMS.find((p) => p.id === id);
}
