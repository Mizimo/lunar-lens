#!/bin/sh
set -eu
base=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec /usr/bin/open -a Max "$base/lunar-lens.maxproj"
