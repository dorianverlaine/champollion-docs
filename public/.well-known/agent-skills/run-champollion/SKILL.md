---
name: run-champollion
description: Build Champollion's rvrun on an Apple silicon Mac and run a riscv64 Linux program under it.
---

# Run Champollion

Use this skill when a riscv64 Linux binary has to run on an Apple silicon Mac:
to build `rvrun` from source, to run the repository's fixtures, or to run a
real program against a riscv64 userland.

## Prerequisites

- An Apple silicon Mac (macOS arm64) with Rust stable (edition 2024, rustc
  1.85 or newer).
- The riscv64 Linux ELF to run, and — for dynamically linked programs — a
  riscv64 userland (for example an Alpine minirootfs) to point `-L` at.

## Steps

1. Clone and build the release binary:

   ```bash
   git clone https://github.com/dorian-zhao/champollion.git
   cd champollion
   cargo build --release -p rvrun
   ```

2. Run the shipped fixture; it prints one line:

   ```bash
   ./target/release/rvrun tests/fixtures/hello
   # hello from riscv64
   ```

3. Run a real program. A dynamically linked one wants its userland:

   ```bash
   ./target/release/rvrun -L /path/to/riscv64-rootfs ./some-program
   ```

4. Observe the run when it matters: `RVRUN_STRACE=1` traces every syscall to
   stderr, `RVRUN_STATS=1` prints instructions retired and speed on exit, and
   `RVRUN_PROF=FILE` samples generated code for `tools/jitprof.py`.

## Failure modes

- `dynamically linked, and its loader /lib/ld-musl-riscv64.so.1 is missing` —
  pass a sysroot: `-L /path/to/rootfs`.
- A program that needs a full userland (package managers, containers) is out
  of route B's scope; route A runs it inside an arm64 Linux VM with raw
  syscalls.
- The interpreter is always available while debugging: `RVRUN_JIT=0`.

## Source

- <https://champollion.dorian.page/start/getting-started.md>
- <https://champollion.dorian.page/reference/cli.md>
