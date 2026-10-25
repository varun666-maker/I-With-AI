export interface SuggestionItem {
  label: string;
  insertText: string;
  type: "function" | "keyword" | "method" | "type";
  detail: string;
  cursorOffset?: number; // Distance from end of insertText to place cursor
}

export type SupportedLanguage = "Python" | "Java" | "JavaScript" | "C++";

export const LANGUAGE_SUGGESTIONS: Record<SupportedLanguage, SuggestionItem[]> = {
  Python: [
    // Built-in functions
    { label: "len", insertText: "len()", type: "function", detail: "len(obj) -> Return item count", cursorOffset: 1 },
    { label: "range", insertText: "range()", type: "function", detail: "range(stop) or range(start, stop[, step])", cursorOffset: 1 },
    { label: "enumerate", insertText: "enumerate()", type: "function", detail: "enumerate(iterable, start=0)", cursorOffset: 1 },
    { label: "zip", insertText: "zip()", type: "function", detail: "zip(*iterables) -> iterate pairs", cursorOffset: 1 },
    { label: "sorted", insertText: "sorted()", type: "function", detail: "sorted(iterable, key=..., reverse=False)", cursorOffset: 1 },
    { label: "min", insertText: "min()", type: "function", detail: "min(arg1, arg2, *args, key=...)", cursorOffset: 1 },
    { label: "max", insertText: "max()", type: "function", detail: "max(arg1, arg2, *args, key=...)", cursorOffset: 1 },
    { label: "abs", insertText: "abs()", type: "function", detail: "abs(x) -> Absolute value", cursorOffset: 1 },
    { label: "sum", insertText: "sum()", type: "function", detail: "sum(iterable, start=0)", cursorOffset: 1 },
    { label: "print", insertText: "print()", type: "function", detail: "print(*values, sep=' ', end='\\n')", cursorOffset: 1 },
    { label: "any", insertText: "any()", type: "function", detail: "any(iterable) -> bool", cursorOffset: 1 },
    { label: "all", insertText: "all()", type: "function", detail: "all(iterable) -> bool", cursorOffset: 1 },
    { label: "reversed", insertText: "reversed()", type: "function", detail: "reversed(sequence) -> reverse iterator", cursorOffset: 1 },
    { label: "isinstance", insertText: "isinstance()", type: "function", detail: "isinstance(object, classinfo)", cursorOffset: 1 },
    { label: "map", insertText: "map()", type: "function", detail: "map(func, *iterables)", cursorOffset: 1 },
    { label: "filter", insertText: "filter()", type: "function", detail: "filter(function, iterable)", cursorOffset: 1 },
    { label: "list", insertText: "list()", type: "type", detail: "list([iterable]) -> new list", cursorOffset: 1 },
    { label: "dict", insertText: "dict()", type: "type", detail: "dict(**kwargs) -> new dictionary", cursorOffset: 1 },
    { label: "set", insertText: "set()", type: "type", detail: "set([iterable]) -> new set", cursorOffset: 1 },
    { label: "tuple", insertText: "tuple()", type: "type", detail: "tuple([iterable]) -> new tuple", cursorOffset: 1 },
    { label: "str", insertText: "str()", type: "type", detail: "str(object='') -> string", cursorOffset: 1 },
    { label: "int", insertText: "int()", type: "type", detail: "int(x=0) -> integer", cursorOffset: 1 },
    { label: "float", insertText: "float()", type: "type", detail: "float(x=0.0) -> floating point", cursorOffset: 1 },
    { label: "bool", insertText: "bool()", type: "type", detail: "bool([x]) -> boolean", cursorOffset: 1 },

    // Keywords
    { label: "def", insertText: "def ", type: "keyword", detail: "Function definition statement" },
    { label: "return", insertText: "return ", type: "keyword", detail: "Return from function" },
    { label: "class", insertText: "class ", type: "keyword", detail: "Class definition statement" },
    { label: "if", insertText: "if ", type: "keyword", detail: "Conditional branch statement" },
    { label: "elif", insertText: "elif ", type: "keyword", detail: "Else-if condition" },
    { label: "else", insertText: "else:", type: "keyword", detail: "Else clause" },
    { label: "for", insertText: "for ", type: "keyword", detail: "For loop iteration" },
    { label: "while", insertText: "while ", type: "keyword", detail: "While loop" },
    { label: "break", insertText: "break", type: "keyword", detail: "Break out of innermost loop" },
    { label: "continue", insertText: "continue", type: "keyword", detail: "Continue to next loop iteration" },
    { label: "pass", insertText: "pass", type: "keyword", detail: "Null operation placeholder" },
    { label: "yield", insertText: "yield ", type: "keyword", detail: "Yield value from generator" },
    { label: "import", insertText: "import ", type: "keyword", detail: "Import module" },
    { label: "from", insertText: "from ", type: "keyword", detail: "From module import ..." },
    { label: "in", insertText: "in ", type: "keyword", detail: "Membership test operator" },
    { label: "is", insertText: "is ", type: "keyword", detail: "Identity comparison operator" },
    { label: "not", insertText: "not ", type: "keyword", detail: "Logical negation" },
    { label: "and", insertText: "and ", type: "keyword", detail: "Logical AND" },
    { label: "or", insertText: "or ", type: "keyword", detail: "Logical OR" },
    { label: "lambda", insertText: "lambda ", type: "keyword", detail: "Anonymous lambda function" },
    { label: "None", insertText: "None", type: "keyword", detail: "Python None singleton" },
    { label: "True", insertText: "True", type: "keyword", detail: "Boolean True" },
    { label: "False", insertText: "False", type: "keyword", detail: "Boolean False" },

    // Common list/dict/set methods
    { label: "append", insertText: "append()", type: "method", detail: "list.append(x) -> Append object to end", cursorOffset: 1 },
    { label: "pop", insertText: "pop()", type: "method", detail: "list.pop([i]) / dict.pop(k[, d])", cursorOffset: 1 },
    { label: "extend", insertText: "extend()", type: "method", detail: "list.extend(iterable) -> Extend list", cursorOffset: 1 },
    { label: "insert", insertText: "insert()", type: "method", detail: "list.insert(i, x) -> Insert at index", cursorOffset: 1 },
    { label: "remove", insertText: "remove()", type: "method", detail: "list.remove(value) / set.remove(elem)", cursorOffset: 1 },
    { label: "sort", insertText: "sort()", type: "method", detail: "list.sort(key=..., reverse=...)", cursorOffset: 1 },
    { label: "reverse", insertText: "reverse()", type: "method", detail: "list.reverse() -> Reverse in-place" },
    { label: "index", insertText: "index()", type: "method", detail: "list.index(x[, start[, end]])", cursorOffset: 1 },
    { label: "count", insertText: "count()", type: "method", detail: "list.count(value) -> occurrences", cursorOffset: 1 },
    { label: "get", insertText: "get()", type: "method", detail: "dict.get(key[, default])", cursorOffset: 1 },
    { label: "keys", insertText: "keys()", type: "method", detail: "dict.keys() -> view of keys" },
    { label: "values", insertText: "values()", type: "method", detail: "dict.values() -> view of values" },
    { label: "items", insertText: "items()", type: "method", detail: "dict.items() -> view of (k, v) pairs" },
    { label: "add", insertText: "add()", type: "method", detail: "set.add(elem) -> Add element to set", cursorOffset: 1 },
    { label: "split", insertText: "split()", type: "method", detail: "str.split(sep=None, maxsplit=-1)", cursorOffset: 1 },
    { label: "join", insertText: "join()", type: "method", detail: "str.join(iterable) -> string", cursorOffset: 1 },
    { label: "strip", insertText: "strip()", type: "method", detail: "str.strip([chars]) -> trimmed string", cursorOffset: 1 },
    { label: "startswith", insertText: "startswith()", type: "method", detail: "str.startswith(prefix)", cursorOffset: 1 },
    { label: "endswith", insertText: "endswith()", type: "method", detail: "str.endswith(suffix)", cursorOffset: 1 },

    // Pre-imported collections / heapq / math
    { label: "defaultdict", insertText: "collections.defaultdict()", type: "function", detail: "collections.defaultdict(default_factory)", cursorOffset: 1 },
    { label: "Counter", insertText: "collections.Counter()", type: "function", detail: "collections.Counter(iterable)", cursorOffset: 1 },
    { label: "deque", insertText: "collections.deque()", type: "function", detail: "collections.deque(iterable)", cursorOffset: 1 },
    { label: "heappush", insertText: "heapq.heappush()", type: "function", detail: "heapq.heappush(heap, item)", cursorOffset: 1 },
    { label: "heappop", insertText: "heapq.heappop()", type: "function", detail: "heapq.heappop(heap) -> smallest", cursorOffset: 1 },
    { label: "heapify", insertText: "heapq.heapify()", type: "function", detail: "heapq.heapify(list) -> in-place min-heap", cursorOffset: 1 },
    { label: "bisect_left", insertText: "bisect.bisect_left()", type: "function", detail: "bisect.bisect_left(a, x)", cursorOffset: 1 },
    { label: "bisect_right", insertText: "bisect.bisect_right()", type: "function", detail: "bisect.bisect_right(a, x)", cursorOffset: 1 },
    { label: "math.floor", insertText: "math.floor()", type: "function", detail: "math.floor(x) -> integer floor", cursorOffset: 1 },
    { label: "math.ceil", insertText: "math.ceil()", type: "function", detail: "math.ceil(x) -> integer ceiling", cursorOffset: 1 },
    { label: "math.sqrt", insertText: "math.sqrt()", type: "function", detail: "math.sqrt(x) -> square root", cursorOffset: 1 },
    { label: "math.inf", insertText: "math.inf", type: "type", detail: "Floating point positive infinity" },
  ],

  JavaScript: [
    // Globals & built-in functions
    { label: "console.log", insertText: "console.log()", type: "function", detail: "Log output to console", cursorOffset: 1 },
    { label: "parseInt", insertText: "parseInt()", type: "function", detail: "parseInt(string, radix)", cursorOffset: 1 },
    { label: "parseFloat", insertText: "parseFloat()", type: "function", detail: "parseFloat(string)", cursorOffset: 1 },
    { label: "Math.max", insertText: "Math.max()", type: "function", detail: "Math.max(...values)", cursorOffset: 1 },
    { label: "Math.min", insertText: "Math.min()", type: "function", detail: "Math.min(...values)", cursorOffset: 1 },
    { label: "Math.floor", insertText: "Math.floor()", type: "function", detail: "Math.floor(x)", cursorOffset: 1 },
    { label: "Math.ceil", insertText: "Math.ceil()", type: "function", detail: "Math.ceil(x)", cursorOffset: 1 },
    { label: "Math.round", insertText: "Math.round()", type: "function", detail: "Math.round(x)", cursorOffset: 1 },
    { label: "Math.abs", insertText: "Math.abs()", type: "function", detail: "Math.abs(x)", cursorOffset: 1 },
    { label: "Math.sqrt", insertText: "Math.sqrt()", type: "function", detail: "Math.sqrt(x)", cursorOffset: 1 },
    { label: "JSON.stringify", insertText: "JSON.stringify()", type: "function", detail: "Serialize to JSON string", cursorOffset: 1 },
    { label: "JSON.parse", insertText: "JSON.parse()", type: "function", detail: "Parse JSON string", cursorOffset: 1 },

    // Keywords
    { label: "function", insertText: "function ", type: "keyword", detail: "Function declaration" },
    { label: "return", insertText: "return ", type: "keyword", detail: "Return from function" },
    { label: "const", insertText: "const ", type: "keyword", detail: "Block-scoped constant" },
    { label: "let", insertText: "let ", type: "keyword", detail: "Block-scoped variable" },
    { label: "var", insertText: "var ", type: "keyword", detail: "Function-scoped variable" },
    { label: "if", insertText: "if ()", type: "keyword", detail: "Conditional statement", cursorOffset: 1 },
    { label: "else", insertText: "else {\n    \n}", type: "keyword", detail: "Else clause", cursorOffset: 2 },
    { label: "for", insertText: "for (let i = 0; i < ; i++)", type: "keyword", detail: "For loop", cursorOffset: 7 },
    { label: "while", insertText: "while ()", type: "keyword", detail: "While loop", cursorOffset: 1 },
    { label: "break", insertText: "break;", type: "keyword", detail: "Break loop execution" },
    { label: "continue", insertText: "continue;", type: "keyword", detail: "Continue next iteration" },
    { label: "true", insertText: "true", type: "keyword", detail: "Boolean true" },
    { label: "false", insertText: "false", type: "keyword", detail: "Boolean false" },
    { label: "null", insertText: "null", type: "keyword", detail: "Null reference" },
    { label: "undefined", insertText: "undefined", type: "keyword", detail: "Undefined value" },

    // Array / Map / Set methods
    { label: "push", insertText: "push()", type: "method", detail: "Array.prototype.push(item)", cursorOffset: 1 },
    { label: "pop", insertText: "pop()", type: "method", detail: "Array.prototype.pop() -> last element" },
    { label: "shift", insertText: "shift()", type: "method", detail: "Array.prototype.shift() -> first element" },
    { label: "unshift", insertText: "unshift()", type: "method", detail: "Array.prototype.unshift(item)", cursorOffset: 1 },
    { label: "slice", insertText: "slice()", type: "method", detail: "Array/String.slice(start, end)", cursorOffset: 1 },
    { label: "splice", insertText: "splice()", type: "method", detail: "Array.splice(start, deleteCount, ...items)", cursorOffset: 1 },
    { label: "indexOf", insertText: "indexOf()", type: "method", detail: "indexOf(searchElement)", cursorOffset: 1 },
    { label: "includes", insertText: "includes()", type: "method", detail: "includes(valueToFind)", cursorOffset: 1 },
    { label: "map", insertText: "map()", type: "method", detail: "Array.map((item, index) => ...)", cursorOffset: 1 },
    { label: "filter", insertText: "filter()", type: "method", detail: "Array.filter((item) => ...)", cursorOffset: 1 },
    { label: "reduce", insertText: "reduce()", type: "method", detail: "Array.reduce((acc, curr) => ..., init)", cursorOffset: 1 },
    { label: "sort", insertText: "sort()", type: "method", detail: "Array.sort((a, b) => a - b)", cursorOffset: 1 },
    { label: "length", insertText: "length", type: "type", detail: "Array / String length property" },
    { label: "set", insertText: "set()", type: "method", detail: "Map.set(key, value)", cursorOffset: 1 },
    { label: "get", insertText: "get()", type: "method", detail: "Map.get(key)", cursorOffset: 1 },
    { label: "has", insertText: "has()", type: "method", detail: "Map/Set.has(value)", cursorOffset: 1 },
    { label: "add", insertText: "add()", type: "method", detail: "Set.add(value)", cursorOffset: 1 },
  ],

  Java: [
    // Keywords & Types
    { label: "public", insertText: "public ", type: "keyword", detail: "Public access modifier" },
    { label: "private", insertText: "private ", type: "keyword", detail: "Private access modifier" },
    { label: "static", insertText: "static ", type: "keyword", detail: "Static member modifier" },
    { label: "final", insertText: "final ", type: "keyword", detail: "Final variable/class" },
    { label: "int", insertText: "int ", type: "type", detail: "32-bit integer primitive" },
    { label: "long", insertText: "long ", type: "type", detail: "64-bit integer primitive" },
    { label: "double", insertText: "double ", type: "type", detail: "64-bit floating point" },
    { label: "boolean", insertText: "boolean ", type: "type", detail: "Boolean primitive (true/false)" },
    { label: "char", insertText: "char ", type: "type", detail: "16-bit Unicode character" },
    { label: "String", insertText: "String ", type: "type", detail: "java.lang.String class" },
    { label: "return", insertText: "return ", type: "keyword", detail: "Return from method" },
    { label: "if", insertText: "if ()", type: "keyword", detail: "Conditional branch", cursorOffset: 1 },
    { label: "else", insertText: "else {\n    \n}", type: "keyword", detail: "Else statement block", cursorOffset: 2 },
    { label: "for", insertText: "for (int i = 0; i < ; i++)", type: "keyword", detail: "For loop", cursorOffset: 7 },
    { label: "while", insertText: "while ()", type: "keyword", detail: "While loop", cursorOffset: 1 },
    { label: "break", insertText: "break;", type: "keyword", detail: "Break statement" },
    { label: "continue", insertText: "continue;", type: "keyword", detail: "Continue loop" },
    { label: "new", insertText: "new ", type: "keyword", detail: "Instantiate object" },

    // Standard Java Collections & Methods
    { label: "System.out.println", insertText: "System.out.println()", type: "function", detail: "Print line to standard out", cursorOffset: 1 },
    { label: "Math.max", insertText: "Math.max()", type: "function", detail: "Math.max(a, b)", cursorOffset: 1 },
    { label: "Math.min", insertText: "Math.min()", type: "function", detail: "Math.min(a, b)", cursorOffset: 1 },
    { label: "Math.abs", insertText: "Math.abs()", type: "function", detail: "Math.abs(a)", cursorOffset: 1 },
    { label: "Arrays.sort", insertText: "Arrays.sort()", type: "function", detail: "Arrays.sort(array)", cursorOffset: 1 },
    { label: "Collections.sort", insertText: "Collections.sort()", type: "function", detail: "Collections.sort(list)", cursorOffset: 1 },
    { label: "length", insertText: "length()", type: "method", detail: "String.length() -> character count" },
    { label: "charAt", insertText: "charAt()", type: "method", detail: "String.charAt(index)", cursorOffset: 1 },
    { label: "substring", insertText: "substring()", type: "method", detail: "String.substring(begin, end)", cursorOffset: 1 },
    { label: "indexOf", insertText: "indexOf()", type: "method", detail: "String/List.indexOf(elem)", cursorOffset: 1 },
    { label: "toCharArray", insertText: "toCharArray()", type: "method", detail: "String.toCharArray() -> char[]" },
    { label: "add", insertText: "add()", type: "method", detail: "List/Set.add(element)", cursorOffset: 1 },
    { label: "get", insertText: "get()", type: "method", detail: "List.get(index) / Map.get(key)", cursorOffset: 1 },
    { label: "put", insertText: "put()", type: "method", detail: "Map.put(key, value)", cursorOffset: 1 },
    { label: "getOrDefault", insertText: "getOrDefault()", type: "method", detail: "Map.getOrDefault(key, defaultVal)", cursorOffset: 1 },
    { label: "containsKey", insertText: "containsKey()", type: "method", detail: "Map.containsKey(key)", cursorOffset: 1 },
    { label: "size", insertText: "size()", type: "method", detail: "Collection.size() -> element count" },
    { label: "isEmpty", insertText: "isEmpty()", type: "method", detail: "Collection.isEmpty() -> boolean" },
  ],

  "C++": [
    // Keywords & Types
    { label: "int", insertText: "int ", type: "type", detail: "Integer type" },
    { label: "long long", insertText: "long long ", type: "type", detail: "64-bit integer" },
    { label: "double", insertText: "double ", type: "type", detail: "Double floating point" },
    { label: "bool", insertText: "bool ", type: "type", detail: "Boolean type" },
    { label: "char", insertText: "char ", type: "type", detail: "Character type" },
    { label: "string", insertText: "string ", type: "type", detail: "std::string class" },
    { label: "vector", insertText: "vector<>", type: "type", detail: "std::vector<T>", cursorOffset: 1 },
    { label: "auto", insertText: "auto ", type: "keyword", detail: "Automatic type deduction" },
    { label: "return", insertText: "return ", type: "keyword", detail: "Return from function" },
    { label: "if", insertText: "if ()", type: "keyword", detail: "Conditional branch", cursorOffset: 1 },
    { label: "else", insertText: "else {\n    \n}", type: "keyword", detail: "Else statement", cursorOffset: 2 },
    { label: "for", insertText: "for (int i = 0; i < ; i++)", type: "keyword", detail: "For loop", cursorOffset: 7 },
    { label: "while", insertText: "while ()", type: "keyword", detail: "While loop", cursorOffset: 1 },
    { label: "break", insertText: "break;", type: "keyword", detail: "Break statement" },
    { label: "continue", insertText: "continue;", type: "keyword", detail: "Continue statement" },

    // STL Methods & Functions
    { label: "push_back", insertText: "push_back()", type: "method", detail: "vector.push_back(val)", cursorOffset: 1 },
    { label: "pop_back", insertText: "pop_back()", type: "method", detail: "vector.pop_back()" },
    { label: "size", insertText: "size()", type: "method", detail: "container.size() -> element count" },
    { label: "empty", insertText: "empty()", type: "method", detail: "container.empty() -> boolean" },
    { label: "clear", insertText: "clear()", type: "method", detail: "container.clear()" },
    { label: "begin", insertText: "begin()", type: "method", detail: "container.begin() -> iterator" },
    { label: "end", insertText: "end()", type: "method", detail: "container.end() -> iterator" },
    { label: "max", insertText: "max()", type: "function", detail: "std::max(a, b)", cursorOffset: 1 },
    { label: "min", insertText: "min()", type: "function", detail: "std::min(a, b)", cursorOffset: 1 },
    { label: "abs", insertText: "abs()", type: "function", detail: "std::abs(x)", cursorOffset: 1 },
    { label: "sort", insertText: "sort()", type: "function", detail: "std::sort(v.begin(), v.end())", cursorOffset: 1 },
    { label: "reverse", insertText: "reverse()", type: "function", detail: "std::reverse(v.begin(), v.end())", cursorOffset: 1 },
  ],
};

/**
 * Filter suggestions matching the currently typed word prefix.
 * Only triggers on prefix length >= 1.
 */
export function getSuggestions(language: SupportedLanguage, prefix: string): SuggestionItem[] {
  if (!prefix || prefix.length < 1) return [];
  const lower = prefix.toLowerCase();
  const pool = LANGUAGE_SUGGESTIONS[language] || [];
  
  // Exact or prefix matches prioritized, then contains
  const exactOrPrefix: SuggestionItem[] = [];
  const contains: SuggestionItem[] = [];

  for (const item of pool) {
    const itemLower = item.label.toLowerCase();
    if (itemLower.startsWith(lower)) {
      exactOrPrefix.push(item);
    } else if (itemLower.includes(lower)) {
      contains.push(item);
    }
  }

  return [...exactOrPrefix, ...contains].slice(0, 6);
}
