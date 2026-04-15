using backend.Services;
using Microsoft.AspNetCore.Identity;

namespace backend.Tests;

public class InMemoryAuthUserStoreTests
{
    [Fact]
    public void ValidateCredentials_ReturnsUser_WhenPasswordIsCorrect()
    {
        var store = new InMemoryAuthUserStore(new PasswordHasher<backend.Models.AuthUser>());
        var createdUser = store.CreateUser("student1", "StrongPass123!");

        var validatedUser = store.ValidateCredentials("student1", "StrongPass123!");

        Assert.NotNull(validatedUser);
        Assert.Equal(createdUser.Id, validatedUser!.Id);
        Assert.Equal("student1", validatedUser.Username);
    }

    [Fact]
    public void ValidateCredentials_ReturnsNull_WhenPasswordIsIncorrect()
    {
        var store = new InMemoryAuthUserStore(new PasswordHasher<backend.Models.AuthUser>());
        store.CreateUser("student2", "StrongPass123!");

        var validatedUser = store.ValidateCredentials("student2", "WrongPassword!");

        Assert.Null(validatedUser);
    }
}