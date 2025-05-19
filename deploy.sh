#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Début du processus de déploiement...${NC}"

# 1. Configuration de l'environnement de production
echo -e "${BLUE}⚙️ Configuration de l'environnement de production...${NC}"
cd frontend
echo "VITE_BACKEND_URL=https://ensta-in211.vercel.app" > .env.production
echo -e "${GREEN}✅ Configuration terminée${NC}"

# 2. Build du frontend
echo -e "${BLUE}📦 Construction du frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    exit 1
fi
echo -e "${GREEN}✅ Build du frontend terminé${NC}"

# 3. Création du dossier public dans le backend s'il n'existe pas
echo -e "${BLUE}📁 Préparation du dossier public...${NC}"
cd ../backend
mkdir -p public

# 4. Copie des fichiers buildés
echo -e "${BLUE}📋 Copie des fichiers buildés...${NC}"
rm -rf public/*
cp -r ../frontend/build/* public/
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la copie des fichiers"
    exit 1
fi
echo -e "${GREEN}✅ Fichiers copiés avec succès${NC}"

# 5. Commit des changements
echo -e "${BLUE}💾 Commit des changements...${NC}"
cd ..
git add .
git commit -m "chore: mise à jour des fichiers de build et configuration production"
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du commit"
    exit 1
fi
echo -e "${GREEN}✅ Changements commités${NC}"

# 6. Push des changements
echo -e "${BLUE}📤 Push des changements...${NC}"
git push
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du push"
    exit 1
fi
echo -e "${GREEN}✅ Changements poussés${NC}"

# 7. Déploiement sur Vercel
echo -e "${BLUE}🚀 Déploiement sur Vercel...${NC}"
vercel deploy --prod
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du déploiement Vercel"
    exit 1
fi

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${BLUE}🌐 Vérifiez votre application sur Vercel${NC}" 