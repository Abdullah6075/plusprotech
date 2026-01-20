import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '../store/authSlice'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const Home = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-4xl font-bold">
              Mobile Repairing Company Management System
            </CardTitle>
            <CardDescription className="text-lg">
              PlusProtech Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  Welcome back, {user?.name}!
                </p>
                <Button asChild size="lg">
                  <Link to="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/login">
                    Login
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home
