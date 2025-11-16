// src/lib/languageOptions.js
// Monaco-supported active Judge0 languages only

export const languageOptions = [
  {
    name: "JavaScript",
    version: "Node.js 12.14.0",
    id: "javascript",
    judge0: 63,
    boilerplate: `// SyntaxSpace - JavaScript
console.log("Hello from SyntaxSpace JavaScript!");`
  },

  {
    name: "TypeScript",
    version: "TypeScript 3.7.4",
    id: "typescript",
    judge0: 74,
    boilerplate: `// SyntaxSpace - TypeScript
const message: string = "Hello from SyntaxSpace TypeScript!";
console.log(message);`
  },

  {
    name: "Python",
    version: "Python 3.8.1",
    id: "python",
    judge0: 71,
    boilerplate: `# SyntaxSpace - Python 3
print("Hello from SyntaxSpace Python!")`
  },

  {
    name: "C",
    version: "GCC 9.2.0",
    id: "c",
    judge0: 50,
    boilerplate: `#include <stdio.h>
// SyntaxSpace - C
int main() {
    printf("Hello from SyntaxSpace C!\\n");
    return 0;
}`
  },

  {
    name: "C++",
    version: "GCC 9.2.0 (g++)",
    id: "cpp",
    judge0: 54,
    boilerplate: `#include <iostream>
// SyntaxSpace - C++
int main() {
    std::cout << "Hello from SyntaxSpace C++!" << std::endl;
    return 0;
}`
  },

  {
    name: "Java",
    version: "OpenJDK 13.0.1",
    id: "java",
    judge0: 62,
    boilerplate: `// SyntaxSpace - Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from SyntaxSpace Java!");
    }
}`
  },

  {
    name: "C#",
    version: "Mono 6.6.0.161",
    id: "csharp",
    judge0: 51,
    boilerplate: `// SyntaxSpace - C#
using System;
class Program {
    static void Main() {
        Console.WriteLine("Hello from SyntaxSpace C#!");
    }
}`
  },

  {
    name: "Go",
    version: "Go 1.13.5",
    id: "go",
    judge0: 60,
    boilerplate: `// SyntaxSpace - Go
package main
import "fmt"

func main() {
    fmt.Println("Hello from SyntaxSpace Go!")
}`
  },

  {
    name: "PHP",
    version: "PHP 7.4.1",
    id: "php",
    judge0: 68,
    boilerplate: `<?php
// SyntaxSpace - PHP
echo "Hello from SyntaxSpace PHP!";
?>`
  },

  {
    name: "Ruby",
    version: "Ruby 2.7.0",
    id: "ruby",
    judge0: 72,
    boilerplate: `# SyntaxSpace - Ruby
puts "Hello from SyntaxSpace Ruby!"`
  },

  {
    name: "Rust",
    version: "Rust 1.40.0",
    id: "rust",
    judge0: 73,
    boilerplate: `// SyntaxSpace - Rust
fn main() {
    println!("Hello from SyntaxSpace Rust!");
}`
  },

  {
    name: "Bash",
    version: "Bash 5.0.0",
    id: "bash",
    judge0: 46,
    boilerplate: `# SyntaxSpace - Bash
echo "Hello from SyntaxSpace Bash!"`
  },

  {
    name: "Lua",
    version: "Lua 5.3.5",
    id: "lua",
    judge0: 64,
    boilerplate: `-- SyntaxSpace - Lua
print("Hello from SyntaxSpace Lua!")`
  }
];

export default languageOptions;
