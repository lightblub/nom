if which tput >/dev/null 2>&1; then
  ncolors=$(tput colors)
fi
if [ -t 1 ] && [ -n "$ncolors" ] && [ "$ncolors" -ge 8 ]; then
  RED="$(tput setaf 1)"
  GREEN="$(tput setaf 2)"
  YELLOW="$(tput setaf 3)"
  BLUE="$(tput setaf 4)"
  BOLD="$(tput bold)"
  NORMAL="$(tput sgr0)"
else
  RED=""
  GREEN=""
  YELLOW=""
  BLUE=""
  BOLD=""
  NORMAL=""
fi

set -e

if ! which node > /dev/null; then
  if [ ! which nodejs > /dev/null ]; then
    printf "${RED}"
    echo 'Node.js is not installed'
    printf "${NORMAL}"

    exit 1
  fi
fi

if ! which git > /dev/null; then
  printf "${RED}"
  echo 'git is not installed'
  printf "${NORMAL}"

  exit 1
fi

if [ -d "$HOME/.nom" ]; then
  printf "${YELLOW}"
  printf "nom is already installed or something is occupying ${BOLD}$HOME/.nom${NORMAL}${YELLOW}."
  printf "\n"
  read -r -p "Remove ${BOLD}$HOME/.nom${NORMAL}${YELLOW} and update? [y/N] ${NORMAL}" response

  if [[ ! $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
    exit 1
  else
    rm -rf ~/.nom > /dev/null
    printf "\n"
  fi
fi

printf "Cloning repository..."
git clone https://github.com/nanalan/nom.git ~/.nom --quiet > /dev/null
printf "${GREEN}"
printf ' done'
printf "${NORMAL}\n"

cd ~/.nom
printf "Installing dependencies..."

if which yarn > /dev/null; then
  yarn --ignore-scripts > /dev/null
else
  npm install --ignore-scripts > /dev/null
fi

printf "${GREEN}"
printf ' done'
printf "${NORMAL}\n"

printf "Compiling grammar..."

./node_modules/nearley/bin/nearleyc.js src/grammar/grammar.ne -o src/grammar/grammar.js 2> /dev/null

printf "${GREEN}"
printf ' done'
printf "${NORMAL}\nSymlinking binary..."

if ! npm link > /dev/null; then
  if ! sudo npm link > /dev/null; then
    printf "${RED}"
    printf ' fail'
    printf "${NORMAL}\n"

    exit 1
  fi
fi

if ! which nom > /dev/null; then
  printf "${RED}"
  printf ' fail'
  printf "${NORMAL}\n"

  exit 1
fi

printf "Symlinking binary... ${GREEN}"
printf ' done'
printf "${NORMAL}\n"

# We're finished
printf "${BLUE}"
echo '   _ __   ___  _ __ ___  '
echo "  | '_ \\ / _ \\| '_ \` _ \\ "
echo '  | | | | (_) | | | | | | '
echo '  |_| |_|\___/|_| |_| |_| '
printf "${NORMAL}\n"

printf "  Installed nom "
printf "${BLUE}v"
nom hello
printf "${NORMAL}\n"
