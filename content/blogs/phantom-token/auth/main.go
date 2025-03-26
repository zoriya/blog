package main

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/jwk"
)

type User struct {
	Name string `json:"name"`
}

func main() {
	rsakey, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		log.Fatal(err)
	}

	users := make(map[string]User)

	http.HandleFunc("/auth/user", func(w http.ResponseWriter, r *http.Request) {
		decoder := json.NewDecoder(r.Body)
		var u User
		err := decoder.Decode(&u)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// generate random session id
		id := make([]byte, 64)
		_, err = rand.Read(id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		token := base64.StdEncoding.EncodeToString(id)

		users[token] = u

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(struct {
			Name  string `json:"name"`
			Token string `json:"token"`
		}{Name: u.Name, Token: token})
	})

	http.HandleFunc("/auth/jwt", func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			http.Error(w, "Missing session token", http.StatusUnauthorized)
			return
		}
		token := auth[len("Bearer "):]

		user, ok := users[token]
		if !ok {
			http.Error(w, "Invalid token", http.StatusForbidden)
			return
		}

		claims := make(jwt.MapClaims)
		claims["sub"] = user.Name
		claims["iss"] = "keibi-blog"
		claims["iat"] = &jwt.NumericDate{
			Time: time.Now().UTC(),
		}
		claims["exp"] = &jwt.NumericDate{
			Time: time.Now().UTC().Add(time.Hour),
		}
		jwt := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		t, err := jwt.SignedString(rsakey)
		if err != nil {
			http.Error(w, "Could not sign token", http.StatusInternalServerError)
			return
		}

		w.Header().Add("Authorization", fmt.Sprintf("Bearer %s", t))

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(jwt)
	})

	http.HandleFunc("/.well-known/jwks.json", func(w http.ResponseWriter, r *http.Request) {
		key, err := jwk.New(rsakey.PublicKey)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		key.Set("use", "sig")
		key.Set("key_ops", "verify")
		set := jwk.NewSet()
		set.Add(key)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(set)
	})

	log.Fatal(http.ListenAndServe(":8080", nil))
}
