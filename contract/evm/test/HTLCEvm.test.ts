import { expect } from "chai";
import { ethers } from "hardhat";
import { HTLCEvm, MockERC20, HTLCEvm__factory, MockERC20__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const getPreimageAsBytes32 = (secret: string) => {
    return ethers.zeroPadValue(ethers.toUtf8Bytes(secret), 32);
};

const createHashlock = (secret: string) => {
    return ethers.sha256(getPreimageAsBytes32(secret));
};

describe("HTLCEvm", function () {
    let htlc: HTLCEvm;
    let token: MockERC20;
    let owner: SignerWithAddress;
    let sender: SignerWithAddress;
    let receiver: SignerWithAddress;

    const amount = ethers.parseUnits("100", 18);
    const secret = "my_super_secret_preimage";
    const hashlock = createHashlock(secret);
    let timelock: number;

    beforeEach(async function () {
        [owner, sender, receiver] = await ethers.getSigners();

        const TokenFactory = (await ethers.getContractFactory("MockERC20", owner)) as MockERC20__factory;
        token = await TokenFactory.deploy();
        await token.waitForDeployment();
        const tokenAddress = await token.getAddress();

        await token.connect(owner).mint(sender.address, amount * 10n);

        const HTLCFactory = (await ethers.getContractFactory("HTLCEvm")) as HTLCEvm__factory;
        htlc = await HTLCFactory.deploy();
        await htlc.waitForDeployment();

        const htlcAddress = await htlc.getAddress();
        await token.connect(sender).approve(htlcAddress, amount * 10n);

        const latestTime = await time.latest();
        timelock = latestTime + 3600;
    });

    describe("Lock", function () {
        it("lock() happy path: Lock ERC20 tokens, verify event emitted, contract balance", async function () {
            const htlcAddress = await htlc.getAddress();
            const tokenAddress = await token.getAddress();

            const senderInitialBal = await token.balanceOf(sender.address);
            const htlcInitialBal = await token.balanceOf(htlcAddress);

            const tx = await htlc.connect(sender).lock(
                receiver.address,
                tokenAddress,
                amount,
                hashlock,
                timelock
            );

            const receipt = await tx.wait();
            if (!receipt) throw new Error("No receipt");

            const lockedLog = receipt.logs.find(
                (log) => htlc.interface.parseLog(log as any)?.name === "Locked"
            );
            if (!lockedLog) throw new Error("Locked event not found");
            const lockedEvent = htlc.interface.parseLog(lockedLog as any);

            const lockId = lockedEvent?.args.lockId;
            expect(lockedEvent?.args.sender).to.equal(sender.address);
            expect(lockedEvent?.args.receiver).to.equal(receiver.address);
            expect(lockedEvent?.args.amount).to.equal(amount);

            const senderFinalBal = await token.balanceOf(sender.address);
            const htlcFinalBal = await token.balanceOf(htlcAddress);

            expect(senderInitialBal - senderFinalBal).to.equal(amount);
            expect(htlcFinalBal - htlcInitialBal).to.equal(amount);

            const lockEntry = await htlc.locks(lockId);
            expect(lockEntry.sender).to.equal(sender.address);
            expect(lockEntry.receiver).to.equal(receiver.address);
            expect(lockEntry.amount).to.equal(amount);
            expect(lockEntry.withdrawn).to.be.false;
            expect(lockEntry.refunded).to.be.false;
        });

        it("Reject zero amount: lock() with amount 0 reverts", async function () {
            const tokenAddress = await token.getAddress();
            await expect(
                htlc.connect(sender).lock(receiver.address, tokenAddress, 0n, hashlock, timelock)
            ).to.be.revertedWith("amount must be positive");
        });

        it("Reject past timelock: lock() with expired timelock reverts", async function () {
            const tokenAddress = await token.getAddress();
            const latestTime = await time.latest();
            await expect(
                htlc.connect(sender).lock(receiver.address, tokenAddress, amount, hashlock, latestTime - 1)
            ).to.be.revertedWith("timelock must be future");
        });
    });

    describe("Withdraw & Refund", function () {
        let currentLockId: string;

        beforeEach(async function () {
            const tokenAddress = await token.getAddress();
            const tx = await htlc.connect(sender).lock(
                receiver.address,
                tokenAddress,
                amount,
                hashlock,
                timelock
            );
            const receipt = await tx.wait();
            if (!receipt) throw new Error("No receipt");
            const lockedLog = receipt.logs.find(
                (log) => htlc.interface.parseLog(log as any)?.name === "Locked"
            );
            currentLockId = htlc.interface.parseLog(lockedLog as any)?.args.lockId;
        });

        it("withdraw() with correct preimage: Reveal secret, verify receiver gets tokens", async function () {
            const receiverInitialBal = await token.balanceOf(receiver.address);
            const preimage = getPreimageAsBytes32(secret);

            await expect(htlc.connect(receiver).withdraw(currentLockId, preimage))
                .to.emit(htlc, "Withdrawn")
                .withArgs(currentLockId, preimage);

            const receiverFinalBal = await token.balanceOf(receiver.address);
            expect(receiverFinalBal - receiverInitialBal).to.equal(amount);

            const lockEntry = await htlc.locks(currentLockId);
            expect(lockEntry.withdrawn).to.be.true;
        });

        it("Reject wrong preimage: withdraw() with wrong secret reverts", async function () {
            const wrongPreimage = getPreimageAsBytes32("wrong_secret");
            await expect(
                htlc.connect(receiver).withdraw(currentLockId, wrongPreimage)
            ).to.be.revertedWithCustomError(htlc, "InvalidPreimage");
        });

        it("Reject withdraw after expiry: withdraw() after timelock reverts", async function () {
            const preimage = getPreimageAsBytes32(secret);
            await time.increaseTo(timelock + 1);

            await expect(
                htlc.connect(receiver).withdraw(currentLockId, preimage)
            ).to.be.revertedWithCustomError(htlc, "LockExpired");
        });

        it("refund() after expiry: Fast-forward time, verify sender gets tokens back", async function () {
            const senderInitialBal = await token.balanceOf(sender.address);
            await time.increaseTo(timelock + 1);

            await expect(htlc.connect(sender).refund(currentLockId))
                .to.emit(htlc, "Refunded")
                .withArgs(currentLockId);

            const senderFinalBal = await token.balanceOf(sender.address);
            expect(senderFinalBal - senderInitialBal).to.equal(amount);

            const lockEntry = await htlc.locks(currentLockId);
            expect(lockEntry.refunded).to.be.true;
        });

        it("Reject early refund: refund() before timelock reverts", async function () {
            await expect(
                htlc.connect(sender).refund(currentLockId)
            ).to.be.revertedWithCustomError(htlc, "NotYetExpired");
        });

        it("Reject double withdraw: Second withdraw() reverts", async function () {
            const preimage = getPreimageAsBytes32(secret);
            await htlc.connect(receiver).withdraw(currentLockId, preimage);

            await expect(
                htlc.connect(receiver).withdraw(currentLockId, preimage)
            ).to.be.revertedWithCustomError(htlc, "AlreadyWithdrawn");
        });

        it("Reject double refund: Second refund() reverts", async function () {
            await time.increaseTo(timelock + 1);
            await htlc.connect(sender).refund(currentLockId);

            await expect(
                htlc.connect(sender).refund(currentLockId)
            ).to.be.revertedWithCustomError(htlc, "AlreadyRefunded");
        });
    });
});
