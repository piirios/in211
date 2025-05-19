#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Début du processus de déploiement...${NC}"

# 1. Build du frontend
echo -e "${BLUE}📦 Construction du frontend...${NC}"
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build du frontend"
    exit 1
fi
echo -e "${GREEN}✅ Build du frontend terminé${NC}"

# 2. Création du dossier public dans le backend s'il n'existe pas
echo -e "${BLUE}📁 Préparation du dossier public...${NC}"
cd ../backend
mkdir -p public

# 3. Copie des fichiers buildés
echo -e "${BLUE}📋 Copie des fichiers buildés...${NC}"
rm -rf public/*
cp -r ../frontend/build/* public/
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la copie des fichiers"
    exit 1
fi
echo -e "${GREEN}✅ Fichiers copiés avec succès${NC}"

# 4. Commit des changements
echo -e "${BLUE}💾 Commit des changements...${NC}"
cd ..
git add .
git commit -m "chore: mise à jour des fichiers de build"
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du commit"
    exit 1
fi
echo -e "${GREEN}✅ Changements commités${NC}"

# 5. Push et déploiement sur Vercel
echo -e "${BLUE}🚀 Push et déploiement sur Vercel...${NC}"
git push
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du push"
    exit 1
fi

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${BLUE}🌐 Vérifiez votre application sur Vercel${NC}" 