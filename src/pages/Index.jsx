import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "https://hopeful-desire-21262e95c7.strapiapp.com/api";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUser(token);
      fetchArticles(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchArticles = async (token) => {
    try {
      const response = await fetch(`${API_URL}/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setArticles(data.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          password: user.password,
        }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchUser(data.jwt);
        fetchArticles(data.jwt);
        toast({
          title: "Registration successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration failed",
          description: data.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: user.email,
          password: user.password,
        }),
      });
      const data = await response.json();
      if (data.jwt) {
        localStorage.setItem("token", data.jwt);
        setIsLoggedIn(true);
        fetchUser(data.jwt);
        fetchArticles(data.jwt);
        toast({
          title: "Login successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Login failed",
          description: data.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setArticles([]);
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title,
            description,
          },
        }),
      });
      const data = await response.json();
      setArticles([...articles, data.data]);
      setTitle("");
      setDescription("");
      toast({
        title: "Article created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating article:", error);
    }
  };

  const handleEditArticle = async (articleId, updatedTitle, updatedDescription) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title: updatedTitle,
            description: updatedDescription,
          },
        }),
      });
      const updatedArticles = articles.map((article) => {
        if (article.id === articleId) {
          return {
            ...article,
            attributes: {
              ...article.attributes,
              title: updatedTitle,
              description: updatedDescription,
            },
          };
        }
        return article;
      });
      setArticles(updatedArticles);
      toast({
        title: "Article updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating article:", error);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/articles/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedArticles = articles.filter((article) => article.id !== articleId);
      setArticles(updatedArticles);
      toast({
        title: "Article deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  return (
    <Box maxWidth="600px" margin="auto" padding="4">
      <Heading as="h1" size="xl" textAlign="center" marginBottom="8">
        Article Management
      </Heading>
      {!isLoggedIn ? (
        <Stack spacing="4">
          <FormControl id="username">
            <FormLabel>Username</FormLabel>
            <Input type="text" value={user?.username || ""} onChange={(e) => setUser({ ...user, username: e.target.value })} />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input type="email" value={user?.email || ""} onChange={(e) => setUser({ ...user, email: e.target.value })} />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input type="password" value={user?.password || ""} onChange={(e) => setUser({ ...user, password: e.target.value })} />
          </FormControl>
          <Button onClick={handleRegister}>Register</Button>
          <Button onClick={handleLogin}>Login</Button>
        </Stack>
      ) : (
        <>
          <Text>Welcome, {user?.username}!</Text>
          <Button onClick={handleLogout}>Logout</Button>
          <Stack spacing="4" marginTop="8">
            <FormControl id="title">
              <FormLabel>Title</FormLabel>
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormControl>
            <FormControl id="description">
              <FormLabel>Description</FormLabel>
              <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>
            <Button onClick={handleCreateArticle}>Create Article</Button>
          </Stack>
          <Stack spacing="4" marginTop="8">
            {articles.map((article) => (
              <Box key={article.id} borderWidth="1px" borderRadius="md" padding="4">
                <Heading as="h2" size="md">
                  {article.attributes.title}
                </Heading>
                <Text>{article.attributes.description}</Text>
                <Stack direction="row" spacing="2" marginTop="4">
                  <Button leftIcon={<FaEdit />} size="sm" onClick={() => handleEditArticle(article.id, prompt("Enter updated title", article.attributes.title), prompt("Enter updated description", article.attributes.description))}>
                    Edit
                  </Button>
                  <Button leftIcon={<FaTrash />} size="sm" colorScheme="red" onClick={() => handleDeleteArticle(article.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default Index;
