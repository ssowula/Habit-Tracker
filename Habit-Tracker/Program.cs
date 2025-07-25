using Habit_Tracker.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

app.MapPost("/register", async (string? username, string? password,AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
    {
        return Results.BadRequest("Username and password can't be empty");
    }
    var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
    if (existingUser == null)
    {
        return Results.Conflict("User with this username alredy exists");
    }
    var user = new User
    {
        Username = username,
        PasswordHash = password
    };
    await db.Users.AddAsync(user);
    await db.SaveChangesAsync();

    return Results.Created($"/users/{user.Id}", new { user.Id, user.Username });
});

app.MapPost("/login", async (string? username, string? password, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
    {
        return Results.BadRequest("Username and password can't be empty");
    }
    var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Username == username);
    return Results.Ok();

});
app.Run();