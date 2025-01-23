/**
 * Home page component displaying application overview
 * Landing page showing key features and navigation options
 * Related: components/Navigation.tsx, App.tsx, pages/Recording.tsx
 * Pages in React applications serve as containers for related content and functionality
 */

import React from "react"
import { Container, Typography, Box, Grid, Paper } from "@mui/material"
import { motion } from "framer-motion"
import {
  Code,
  Database,
  Cloud,
  PenTool as Tools,
  Layout,
  TestTube,
  Workflow,
  Award,
} from "lucide-react"

/**
 * Skills data structure defining categories and their attributes
 * Provides organized content structure for the landing page
 * Used within the Home component for rendering skill sections
 * @see {@link https://react.dev/learn/passing-props-to-a-component} - React Props
 */
const skills = [
  {
    category: "Programming Languages",
    items: ["Java", "JavaScript", "Python", "PHP", "Scala", "TypeScript"],
    icon: <Code />,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600",
  },
  {
    category: "System Design",
    items: [
      "UML Architecture",
      "REST API",
      "GRPC",
      "Low-Level Design",
      "High-Level Design",
    ],
    icon: <Layout />,
    image:
      "https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=600",
  },
  {
    category: "Frameworks & UI",
    items: [
      "MERN",
      "PERN",
      "Material UI",
      "Bootstrap",
      "React JS 16.8+",
      "Angular 12+",
    ],
    icon: <Layout />,
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600",
  },
  {
    category: "Databases",
    items: ["PostgreSQL", "MongoDB", "MySQL"],
    icon: <Database />,
    image:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600",
  },
  {
    category: "Cloud & DevOps",
    items: [
      "AWS Lambda",
      "Amplify",
      "API Gateway",
      "IAM",
      "S3",
      "RDS",
      "Dynamo DB",
      "EKS",
      "Docker",
      "Kubernetes",
    ],
    icon: <Cloud />,
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600",
  },
  {
    category: "Testing & Automation",
    items: [
      "TDD",
      "BDD",
      "Unit Testing",
      "Integration Testing",
      "Process Automation",
    ],
    icon: <TestTube />,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600",
  },
]

const experience = [
  {
    title: "Senior Technologist",
    company: "KSS Private Limited, Nagpur, Maharashtra",
    description:
      "Developed intelligent document summarization and retrieval systems using generative AI, retrieval-augmented generation, and Lang Chain pipelines.",
    image:
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=600",
  },
  {
    title: "Senior Software Engineer",
    company: "C.C.E.S. Private Limited, Mumbai, Maharashtra",
    description:
      "Migrated SOA/Microservices architecture using Apache Kafka for real-time analytics.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600",
  },
  {
    title: "Senior Software Engineer",
    company: "S.S.e.S. Private Limited, Hyderabad, Telangana",
    description:
      "Worked on financial dashboards using SOA, MongoDB, React, AWS EKS, Docker, Kubernetes.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600",
  },
  {
    title: "Manager - Projects and Process Improvement",
    company: "Delhivery Private Limited, Gurgaon, Haryana",
    description:
      "Full-stack development, API design, and process automation using MERN/PERN stacks.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600",
  },
  {
    title: "Executive",
    company: "Optimum Logistics Private Limited, Mumbai, Maharashtra",
    description: "Automated import-export documentation using Java.",
    image:
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=600",
  },
  {
    title: "Executive",
    company:
      "Hong Kong and Shanghai Banking Corporation, Vizag & Kolkata, West Bengal",
    description: "Developed credit approval and risk management dashboards.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600",
  },
  {
    title: "Management Trainee",
    company: "Gati Limited, Hyderabad & Bangalore, Karnataka",
    description:
      "Process automation for debtor analysis, invoicing using JavaScript, VBA.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600",
  },
]

/**
 * Home page implementation
 * Renders welcome message and feature highlights
 * Related: components/Navigation.tsx, App.tsx
 * React components can use Material-UI components to create consistent and responsive layouts
 */
export const Home: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Sukumar Satyen
        </Typography>

        <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
          Technical Skills
        </Typography>
        <Grid container spacing={3}>
          {skills.map((skill, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper elevation={3} sx={{ height: "100%" }}>
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${skill.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        textAlign: "center",
                        zIndex: 1,
                      }}
                    >
                      <Box sx={{ mb: 1 }}>{skill.icon}</Box>
                      <Typography
                        variant="h6"
                        sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                      >
                        {skill.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {skill.items.map((item, i) => (
                        <Box
                          key={i}
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.875rem",
                          }}
                        >
                          {item}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
          Professional Experience
        </Typography>
        <Grid container spacing={3}>
          {experience.map((exp, index) => (
            <Grid item xs={12} key={index}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper elevation={3} sx={{ overflow: "hidden" }}>
                  <Grid container>
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          height: { xs: 200, md: "100%" },
                          backgroundImage: `url(${exp.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                          {exp.title}
                        </Typography>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                          {exp.company}
                        </Typography>
                        <Typography variant="body1">
                          {exp.description}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  )
}
