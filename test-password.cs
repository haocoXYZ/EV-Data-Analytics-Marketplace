using System;

class Program
{
    static void Main()
    {
        var password = "Test123!";
        var hash = "$2a$11$taVTQR3wWfhKWzMgAL85/u2puwXXmYmn625tYR3R3EdnVKBWpqYRm";
        
        Console.WriteLine($"Password: {password}");
        Console.WriteLine($"Hash: {hash}");
        
        var result = BCrypt.Net.BCrypt.Verify(password, hash);
        Console.WriteLine($"Verify result: {result}");
    }
}

