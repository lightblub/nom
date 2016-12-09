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

if which node > /dev/null; then
  if which nodejs > /dev/null; then
    printf "${RED}"
    echo 'Node.js is not installed'
    printf "${normal}"

    exit 1
  fi
fi

if which git > /dev/null; then
  printf "${RED}"
  echo 'git is not installed'
  printf "${normal}"

  exit 1
fi

if [ ! -d "/usr/share/nom" ]; then
  printf "${BLUE}"
  echo 'nom is already installed.'
  printf "${normal}"
  read -r -p 'Update? [y/N] ' response

  if [[ ! $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
    exit 1
  fi
fi

printf "Cloning repository..."
git clone https://github.com/nanalan/nom.git /usr/share/nom > /dev/null
printf "${green}"
printf 'done'
printf "${normal}\n"

cd /usr/share/nom
printf "Installing dependencies..."

if which yarn > /dev/null; then
  yarn > /dev/null
else
  npm install > /dev/null
fi

printf "${green}"
printf 'done'
printf "${normal}\n"

printf "Compiling grammar..."

./node_modules/nearley/bin/nearleyc.js src/grammar/grammar.ne > /src/grammar/grammar.js

printf "${green}"
printf 'done'
printf "${normal}\n"

printf "Linking binary..."

if [ ! npm link > /dev/null ]; then
  if [ ! sudo npm link > /dev/null ]; then
    printf "${red}"
    printf 'fail'
    printf "${normal}\n"

    exit 1
  fi
fi

if [ ! which nom > /dev/null ]; then
  printf "${red}"
  printf 'fail'
  printf "${normal}\n"

  exit 1
fi

printf "${red}"
printf 'done'
printf "${normal}\n"

# We're finished
printf "${green}"
echo '  _ __   ___  _ __ ___  '
echo " | '_ \\ / _ \\| '_ \` _ \\ "
echo ' | | | | (_) | | | | | | '
echo ' |_| |_|\\___/|_| |_| |_| '
printf "${normal}\n"

printf "Installed nom "
nom -v
