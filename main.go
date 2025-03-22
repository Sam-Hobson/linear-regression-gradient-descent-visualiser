package main

import (
	"errors"
	"linear-regression-visualiser/internal/routes"
	"linear-regression-visualiser/internal/utils"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const webServerPort = "8080"

func main() {
	utils.SetSessionId(time.Now().UnixMicro())
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	slog.SetDefault(slog.New(handler))

	utils.Log("476e9ba3").Info("The logger is now configured")

	// Initialise the web server
	utils.Log("cbddd68d").Info("Configuring Echo web server")
	e := echo.New()

	// Hides the output starting, this makes it easy to query the JS logs
	e.HideBanner = true
	e.HidePort = true

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Renderer = utils.Template

	// Expose public files from server
	e.Static("/public", "public")

	// Setup routes
	e.GET("/", routes.GetRootRoute())

	utils.Log("08286955").Info("Starting Echo web server on port " + webServerPort)

	if err := e.Start(":8080"); err != nil && !errors.Is(err, http.ErrServerClosed) {
		e.Logger.Fatal(err)
	}
}
